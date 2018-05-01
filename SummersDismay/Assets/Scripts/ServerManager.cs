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
using SBR;

public class ServerManager : MonoBehaviour {
    public SimpleHTTPServer server { get; private set; }

    public static ServerManager inst { get; private set; }

    public string path;
    public RectTransform showURLBG;
    public Text urlStep;
    public Text showURL;
    public Text lastStep;
    public Text showRoomCode;
    public GameObject connectionInfo;
    public GameObject joinButton;
    public string masterServer = "http://35.196.96.77:12345";

    private string roomCode;
    private WWW browserRequest;

    private CooldownTimer regTimer;

    private void Awake() {
        inst = this;

        regTimer = new CooldownTimer(10);
    }

    public void Start() {
        server = new SimpleHTTPServer(path);

        for (int i = 0; i < server.IPs.Count; i++) {
            showURL.text += server.IPs[i];

            if (i < server.IPs.Count - 1) {
                showURL.text += "\n";
            }
        }

        if (server.IPs.Count > 1) {
            urlStep.text = "2. Enter one of these URLs:";
        } else {
            urlStep.text = "2. Enter this URL:";
        }

        showURLBG.sizeDelta = new Vector2(showURLBG.sizeDelta.x, 20 * (1 + showURL.text.Count((c) => c == '\n')));
        connectionInfo.SetActive(true);
        joinButton.SetActive(true);

        JoinServerBrowser(server.IPs[server.IPs.Count - 1]);

    }

    public void JoinInBrowser() {
        if (server != null) {
            Application.OpenURL("http://localhost:" + server.Port);
        }
    }

    private void Update() {
        if (regTimer.Use() && browserRequest == null) {
            JoinServerBrowser(server.IPs[server.IPs.Count - 1]);
        }

        if (browserRequest != null && browserRequest.isDone) {

            if (string.IsNullOrEmpty(browserRequest.error)) {
                urlStep.text = "2. Go to:";
                showURL.text = "summersdismay.gitlab.io";

                roomCode = browserRequest.text;

                lastStep.text = "3. Enter the game code:";
                showRoomCode.gameObject.SetActive(true);
                showRoomCode.text = roomCode;
            } else {
                print("Request Error: " + browserRequest.error);
            }

            browserRequest = null;
        }
    }

    public void JoinServerBrowser(string addr) {
        browserRequest = new WWW(masterServer + "/reg?host=" + WWW.EscapeURL(addr));
    }
}
