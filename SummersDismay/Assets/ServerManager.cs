using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System.Net.Sockets;
using System.Net.NetworkInformation;
using System.Linq;
using System;
using System.Threading;
using UnityEngine.UI;

public class ServerManager : MonoBehaviour {
    private SimpleHTTPServer server;

    public string path;
    public Text showURL;
    public GameObject connectionInfo;



    public void Start() {
        server = new SimpleHTTPServer(path);

        showURL.text = "http://" + server.IP + ":" + server.Port;
        connectionInfo.SetActive(true);
    }
}
