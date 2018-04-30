// MIT License - Copyright (c) 2016 Can Güney Aksakalli
// https://aksakalli.github.io/2014/02/24/simple-http-server-with-csparp.html

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Sockets;
using System.Net;
using System.IO;
using System.Threading;
using Newtonsoft.Json;
using System.Collections.Concurrent;

public class SimpleHTTPServer {
    private Thread _serverThread;
    private HttpListener _listener;
    private int _port;
    private const int expiration = 100000; // 100 seconds

    private ConcurrentDictionary<string, KeyValuePair<long, string>> connections = new ConcurrentDictionary<string, KeyValuePair<long, string>>();
    private ConcurrentBag<string> usedCodes = new ConcurrentBag<string>();

    public int Port {
        get { return _port; }
        private set { }
    }

    /// <summary>
    /// Construct server with suitable port.
    /// </summary>
    /// <param name="path">Directory path to serve.</param>
    public SimpleHTTPServer(int port) {
        Initialize(port);
    }

    /// <summary>
    /// Stop server and dispose all functions.
    /// </summary>
    public void Stop() {
        _serverThread.Abort();
        _listener.Stop();
    }

    private long GetTime() {
        return DateTimeOffset.Now.ToUnixTimeMilliseconds();
    }

    private void ClearExpiredAddrs() {
        long t = GetTime();

        List<string> toRemove = new List<string>();

        foreach (var entry in connections) {
            if (t - entry.Value.Key > expiration) {
                toRemove.Add(entry.Key);
            }
        }

        foreach (var entry in toRemove) {
            KeyValuePair<long, string> l;
            connections.TryRemove(entry, out l);
        }
    }

    private string GetRoomCode() {
        string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Random r = new Random();

        string code = "";
        do {
            for (int i = 0; i < 4; i++) {
                code += alphabet[r.Next(alphabet.Length)];
            }
        } while (usedCodes.Contains(code));

        usedCodes.Add(code);

        return code;
    }

    private void Listen() {
        _listener = new HttpListener();
        _listener.Prefixes.Add("http://*:" + _port.ToString() + "/");
        _listener.Start();

        Console.WriteLine("Listening...");

        while (true) {
            try {
                HttpListenerContext context = _listener.GetContext();
                try {
                    Process(context);
                } catch (Exception ex) {
                    Console.WriteLine(ex);
                }
            } catch { }
        }
    }

    private void Process(HttpListenerContext context) {
        string filename = context.Request.Url.AbsolutePath;
        filename = filename.Substring(1);

        switch (filename) {
            case null:
            case "reg":
                string host = context.Request.QueryString.Get("host");
                if (host != null) {
                    if (connections.ContainsKey(host)) {
                        connections[host] = new KeyValuePair<long, string>(GetTime(), connections[host].Value);
                    } else {
                        connections[host] = new KeyValuePair<long, string>(GetTime(), GetRoomCode());
                        Console.WriteLine("New server registered: " + host);
                    }
                }

                WriteTextToContext(context, connections[host].Value);
                break;

            case "join":
                string code = context.Request.QueryString.Get("code");
                if (code != null) {
                    foreach (var kvp in connections) {
                        if (kvp.Value.Value == code.ToUpper()) {
                            WriteTextToContext(context, kvp.Key);
                            break;
                        }
                    }
                }

                WriteTextToContext(context, "none");
                break;

            default:
                ClearExpiredAddrs();
                Console.WriteLine("List request");
                WriteJsonToContext(context, connections.Keys.ToArray());
                break;
        }
    }

    public void WriteTextToContext(HttpListenerContext context, string str) {
        try {
            byte[] bytes = new ASCIIEncoding().GetBytes(str);

            context.Response.ContentType = "text/plain";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");

            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        } catch {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        }
    }

    public void WriteJsonToContext(HttpListenerContext context, string[] addrs) {
        try {
            string json = JsonConvert.SerializeObject(addrs);
            byte[] bytes = new ASCIIEncoding().GetBytes(json);

            context.Response.ContentType = "application/json";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");

            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        } catch {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        }
    }
    
    private void Initialize(int port) {
        this._port = port;
        _serverThread = new Thread(this.Listen);
        _serverThread.Start();
    }


}