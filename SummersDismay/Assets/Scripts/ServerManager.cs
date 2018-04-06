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
    }

    public void JoinInBrowser() {
        if (server != null) {
            Application.OpenURL("http://localhost:" + server.Port);
        }
    }
}
