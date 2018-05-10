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
using SummersDismayBrowser;

public class Server {
    private Thread _serverThread;
    private HttpListener _listener;
    private int _port;
    private const int expiration = 100000; // 100 seconds

    public static Server inst { get; private set; }

    public int Port {
        get { return _port; }
        private set { }
    }

    /// <summary>
    /// Construct server with suitable port.
    /// </summary>
    /// <param name="path">Directory path to serve.</param>
    public Server(int port) {
        Initialize(port);

        inst = this;
    }

    /// <summary>
    /// Stop server and dispose all functions.
    /// </summary>
    public void Stop() {
        _serverThread.Abort();
        _listener.Stop();
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
        string code;
        GameManager man;

        try {
            switch (filename) {
                case null:
                case "reg":
                    break;

                case "join":
                    code = context.Request.QueryString.Get("code");
                    man = GameManagerManager.GetGame(code);
                    if (man != null) {
                        man.HandleNewConnection(context);
                    } else {
                        WriteTextToContext(context, "none");
                    }
                    break;

                case "update":
                    code = context.Request.QueryString.Get("code");
                    man = GameManagerManager.GetGame(code);
                    if (man != null) {
                        man.HandleUpdate(context);
                    } else {
                        WriteTextToContext(context, "none");
                    }
                    break;

                case "host":
                    string idStr = context.Request.QueryString.Get("id");
                    if (!string.IsNullOrEmpty(idStr)) {
                        int id = int.Parse(idStr);
                        GameManagerManager.KeepAlive(id);
                        Console.WriteLine("Keep Alive: " + id);
                        WriteTextToContext(context, "ok");
                    } else {
                        var game = GameManagerManager.CreateGame();
                        Console.WriteLine("Created Game: " + game);
                        var info = new GameInfo();
                        info.code = game.Item1;
                        info.id = game.Item2;
                        WriteJsonToContext(context, info);
                    }
                    break;
            }
        } catch (Exception ex) {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            Console.WriteLine(ex);
        }
    }

    public static void WriteTextToContext(HttpListenerContext context, string str) {
        try {
            byte[] bytes = new ASCIIEncoding().GetBytes(str);

            context.Response.ContentType = "text/plain";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");
            context.Response.AddHeader("Connection", "close");
            context.Response.AddHeader("Cache-Control", "no-store, must-revalidate");
            context.Response.AddHeader("Expires", "0");

            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        } catch (Exception ex) {
            Console.WriteLine(ex.ToString());
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        }
    }

    public static void WriteJsonToContext(HttpListenerContext context, object obj) {
        try {
            string json = JsonConvert.SerializeObject(obj);
            byte[] bytes = new ASCIIEncoding().GetBytes(json);

            context.Response.ContentType = "application/json";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");
            context.Response.AddHeader("Connection", "close");
            context.Response.AddHeader("Cache-Control", "no-store, must-revalidate");
            context.Response.AddHeader("Expires", "0");

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

    public class GameInfo {
        public string code;
        public int id;
    }
}