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
using System.Runtime.Serialization.Formatters.Binary;

public class ServerManager : MonoBehaviour {
    public SimpleHTTPServer server { get; private set; }

    public static ServerManager inst { get; private set; }

    public string path;
    public RectTransform showURLBG;
    public Text showURL;
    public GameObject connectionInfo;
    public GameObject joinButton;


    private void Awake() {
        inst = this;
    }

    public void Start() {
        server = new SimpleHTTPServer(path);

        for (int i = 0; i < server.IPs.Count; i++) {
            showURL.text += server.IPs[i];

            if (i < server.IPs.Count - 1) {
                showURL.text += "\n";
            }
        }
        
        showURLBG.sizeDelta = new Vector2(showURLBG.sizeDelta.x, 20 * (1 + showURL.text.Count((c) => c == '\n')));
        connectionInfo.SetActive(true);
        joinButton.SetActive(true);

        if (JoinServerBrowser(server.IPs[server.IPs.Count - 1])) {
            showURL.text = "http://ccc.wpi.edu:31313";
        }
    }

    public void JoinInBrowser() {
        if (server != null) {
            Application.OpenURL("http://localhost:" + server.Port);
        }
    }

    public bool JoinServerBrowser(string addr) {
        try {
            TcpClient tcp = new TcpClient("ccc.wpi.edu", 13131);
            byte[] data = System.Text.Encoding.ASCII.GetBytes(addr + "\n");
            tcp.GetStream().Write(data, 0, data.Length);
            return true;
        } catch {
            return false;
        }
    }
}
