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
using System.Diagnostics;
using UnityEngine;

public class SimpleHTTPServer {
    private readonly string[] _indexFiles = {
        "index.html",
        "index.htm",
        "default.html",
        "default.htm"
    };

    private static IDictionary<string, string> _mimeTypeMappings = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase) {
        #region extension to MIME type list
        {".asf", "video/x-ms-asf"},
        {".asx", "video/x-ms-asf"},
        {".avi", "video/x-msvideo"},
        {".bin", "application/octet-stream"},
        {".cco", "application/x-cocoa"},
        {".crt", "application/x-x509-ca-cert"},
        {".css", "text/css"},
        {".deb", "application/octet-stream"},
        {".der", "application/x-x509-ca-cert"},
        {".dll", "application/octet-stream"},
        {".dmg", "application/octet-stream"},
        {".ear", "application/java-archive"},
        {".eot", "application/octet-stream"},
        {".exe", "application/octet-stream"},
        {".flv", "video/x-flv"},
        {".gif", "image/gif"},
        {".hqx", "application/mac-binhex40"},
        {".htc", "text/x-component"},
        {".htm", "text/html"},
        {".html", "text/html"},
        {".ico", "image/x-icon"},
        {".img", "application/octet-stream"},
        {".iso", "application/octet-stream"},
        {".jar", "application/java-archive"},
        {".jardiff", "application/x-java-archive-diff"},
        {".jng", "image/x-jng"},
        {".jnlp", "application/x-java-jnlp-file"},
        {".jpeg", "image/jpeg"},
        {".jpg", "image/jpeg"},
        {".js", "application/x-javascript"},
        {".mml", "text/mathml"},
        {".mng", "video/x-mng"},
        {".mov", "video/quicktime"},
        {".mp3", "audio/mpeg"},
        {".mpeg", "video/mpeg"},
        {".mpg", "video/mpeg"},
        {".msi", "application/octet-stream"},
        {".msm", "application/octet-stream"},
        {".msp", "application/octet-stream"},
        {".pdb", "application/x-pilot"},
        {".pdf", "application/pdf"},
        {".pem", "application/x-x509-ca-cert"},
        {".pl", "application/x-perl"},
        {".pm", "application/x-perl"},
        {".png", "image/png"},
        {".prc", "application/x-pilot"},
        {".ra", "audio/x-realaudio"},
        {".rar", "application/x-rar-compressed"},
        {".rpm", "application/x-redhat-package-manager"},
        {".rss", "text/xml"},
        {".run", "application/x-makeself"},
        {".sea", "application/x-sea"},
        {".shtml", "text/html"},
        {".sit", "application/x-stuffit"},
        {".swf", "application/x-shockwave-flash"},
        {".tcl", "application/x-tcl"},
        {".tk", "application/x-tcl"},
        {".txt", "text/plain"},
        {".war", "application/java-archive"},
        {".wbmp", "image/vnd.wap.wbmp"},
        {".wmv", "video/x-ms-wmv"},
        {".xml", "text/xml"},
        {".xpi", "application/x-xpinstall"},
        {".zip", "application/zip"},
        #endregion
    };
    private Thread _serverThread;
    private string _rootDirectory;
    private HttpListener _listener;
    private int _port;

    public int Port {
        get { return _port; }
        private set { }
    }

    public string IP { get; private set; }

    /// <summary>
    /// Construct server with suitable port.
    /// </summary>
    /// <param name="path">Directory path to serve.</param>
    public SimpleHTTPServer(string path) {
        //get an empty port
        TcpListener l = new TcpListener(IPAddress.Loopback, 0);
        l.Start();
        int port = ((IPEndPoint)l.LocalEndpoint).Port;
        l.Stop();

        string strHostName = Dns.GetHostName();
        IPHostEntry ipEntry = Dns.GetHostEntry(strHostName);
        IPAddress[] addr = ipEntry.AddressList;
        
        for (int i = 0; i < addr.Length; i++) {
            if (addr[i].ToString().StartsWith("130")) {
                IP = addr[i].ToString();
            }
        }

        IP = System.String.Join("\n", System.Array.ConvertAll(addr, (a) => a.ToString()));
        
        Initialize(Path.Combine(Directory.GetParent(Application.dataPath).FullName, path), port);
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
        while (true) {
            try {
                HttpListenerContext context = _listener.GetContext();
                Process(context);
            } catch (Exception ex) {
                UnityEngine.Debug.LogException(ex);
            }
        }
    }

    private void Process(HttpListenerContext context) {
        string filename = context.Request.Url.AbsolutePath;
        filename = filename.Substring(1);
        
        switch(filename) {
            case null:
            case "":
                WriteFileToContext(context, "index.html");
                break;

            case "play":
                GameManager.inst.HandleNewConnection(context);
                break;

            case "update":
                GameManager.inst.HandleUpdate(context);
                break;
            
            default:
                WriteFileToContext(context, filename);
                break;
        }

        context.Response.OutputStream.Close();
    }

    public void WriteJsonToContext(HttpListenerContext context, object obj) {
        try {
            string json = JsonUtility.ToJson(obj);
            byte[] bytes = new ASCIIEncoding().GetBytes(json);

            context.Response.ContentType = "application/json";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
            
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        } catch {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        }
    }

    public void WriteFileToContext(HttpListenerContext context, string filename) {
        filename = Path.Combine(_rootDirectory, filename);
        if (File.Exists(filename)) {
            try {
                Stream input = new FileStream(filename, FileMode.Open);

                //Adding permanent http response headers
                string mime;
                context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(filename), out mime) ? mime : "application/octet-stream";
                context.Response.ContentLength64 = input.Length;
                context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
                context.Response.AddHeader("Last-Modified", System.IO.File.GetLastWriteTime(filename).ToString("r"));

                byte[] buffer = new byte[1024 * 16];
                int nbytes;
                while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0)
                    context.Response.OutputStream.Write(buffer, 0, nbytes);
                input.Close();
            } catch {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            }

        } else {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
        }
    }

    private void Initialize(string path, int port) {
        this._rootDirectory = path;
        this._port = port;
        _serverThread = new Thread(this.Listen);
        _serverThread.Start();
    }


}