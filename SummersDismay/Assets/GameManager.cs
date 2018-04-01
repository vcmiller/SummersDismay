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
using UnityEngine.UI;
using SBR;

public class GameManager : MonoBehaviour {
    public int curJudge { get; private set; }
    public static GameManager inst { get; private set; }

    public GameObject playerIconPrefab;
    public GameObject insultViewPrefab;
    public Button startGameButton;

    private ConnectedPlayer winner;
    private bool voting, insulting, roundOver;
    private ExpirationTimer insultExpiration;
    private ExpirationTimer voteExpiration;
    private ExpirationTimer endExpiration;

    public Sprite[] icons;
    public Text timer;

    public List<ConnectedPlayer> connectedPlayers { get; private set; }

    private void Awake() {
        connectedPlayers = new List<ConnectedPlayer>();
        inst = this;

        insultExpiration = new ExpirationTimer(120);
        voteExpiration = new ExpirationTimer(60);
        endExpiration = new ExpirationTimer(10);
    }

    public void StartGame() {
        if (!(insulting || voting || roundOver)) {
            insulting = true;
        }
    }

    public void HandleNewConnection(HttpListenerContext context) {
        string name = context.Request.QueryString.Get("name");
        if (name.Length > 24) {
            name = name.Substring(0, 24);
        }

        if (name != null) {
            if (GetPlayerInfo(context.Request.RemoteEndPoint.Address) == null) {
                int i = 1;

                var actName = name;
                while (GetPlayerInfo(actName) != null) {
                    actName = name + " (" + i + ")";
                }

                connectedPlayers.Add(new ConnectedPlayer(actName, context.Request.RemoteEndPoint.Address));
                
            }
            ServerManager.inst.server.WriteFileToContext(context, "game.html");
        } else {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
    }

    public void HandleUpdate(HttpListenerContext context) {
        var response = new UpdateResponse();
        var playerInfo = GetPlayerInfo(context.Request.RemoteEndPoint.Address);

        if (playerInfo == null) {
            response.name = "Audience Member";
            response.role = -1;
            response.judge = null;
        } else {
            var judgeInfo = connectedPlayers[curJudge];
            bool isJudge = judgeInfo == playerInfo;

            response.name = playerInfo.name;
            response.judge = judgeInfo.name;
            response.role = isJudge ? 1 : 0;
            response.voted = winner != null;
            
            try {
                var strm = context.Request.InputStream;
                var reader = new StreamReader(strm, context.Request.ContentEncoding);
                string json = reader.ReadToEnd();

                var payload = JsonUtility.FromJson<UpdatePayload>(json);
                if (payload != null) {
                    if (!isJudge && insulting && (playerInfo.receivedInsult == null || playerInfo.receivedInsult.Length == 0)) {
                        playerInfo.receivedInsult = payload.insult;
                    } else if (isJudge && voting && winner == null && payload.vote != null && payload.vote.Length > 0) {
                        winner = GetPlayerInfo(payload.vote);
                        winner.wins++;
                    }
                }
            } catch (Exception ex) {
                UnityEngine.Debug.Log(ex);
            }
        }

        response.running = insulting || voting || roundOver;

        if (insulting) {

        } else if (voting) {
            response.insults = GetInsultsArray();
        } else if (roundOver) {
            response.insults = GetInsultsArray();

            if (winner == null) {
                do {
                    winner = connectedPlayers[UnityEngine.Random.Range(0, connectedPlayers.Count)];
                } while (winner == connectedPlayers[curJudge]);
            }

            response.winner = new Insult();
            response.winner.caster = winner.name;
            response.winner.content = winner.receivedInsult;
        }

        ServerManager.inst.server.WriteJsonToContext(context, response);
    }

    public void NextRound() {
        foreach (var c in connectedPlayers) {
            c.receivedInsult = null;
        }

        winner = null;
        roundOver = false;
        voting = false;
        insulting = true;
        insultExpiration.Set();
        curJudge = (curJudge + 1) % connectedPlayers.Count;
    }

    public bool AllInsultsIn() {
        if (connectedPlayers.Count < 2) {
            return false;
        }

        for (int i = 0; i < connectedPlayers.Count; i++) {
            var p = connectedPlayers[i];
            if (i != curJudge && (p.receivedInsult == null || p.receivedInsult.Length == 0)) {
                return false;
            }
        }

        return true;
    }

    public bool AllVotesIn() {
        if (connectedPlayers.Count < 2) {
            return false;
        }

        return winner != null;
    }

    public Insult[] GetInsultsArray() {
        var insults = new List<Insult>();
        for (int i = 0; i < connectedPlayers.Count; i++) {
            var p = connectedPlayers[i];
            if (i != curJudge) {
                var ins = new Insult();
                ins.caster = p.name;
                ins.content = p.receivedInsult;
                insults.Add(ins);
            }
        }

        return insults.ToArray();
    }

    [Serializable]
    public class UpdatePayload {
        public string insult;
        public string vote;
    }

    [Serializable]
    public class UpdateResponse {
        public string name;
        public int role;
        public string judge;
        public bool voted;
        public bool running;
        public Insult[] insults;
        public Insult winner;
    }

    [Serializable]
    public class Insult {
        public string caster;
        public string content;
    }

    public ConnectedPlayer GetPlayerInfo(IPAddress addr) {
        foreach (var info in connectedPlayers) {
            if (info.remote.Equals(addr)) {
                return info;
            }
        }

        return null;
    }

    public ConnectedPlayer GetPlayerInfo(string name) {
        foreach (var info in connectedPlayers) {
            if (info.name == name) {
                return info;
            }
        }

        return null;
    }

    private void Update() {
        startGameButton.interactable = !(insulting || voting) && connectedPlayers.Count > 1;

        for (int i = 0; i < connectedPlayers.Count; i++) {
            var con = connectedPlayers[i];
            if (!con.iconObject) {
                con.iconObject = Instantiate(playerIconPrefab, new Vector2(0, -7), Quaternion.identity);
                con.iconObject.GetComponent<SpriteRenderer>().sprite = icons[i % icons.Length];
                con.iconObject.GetComponent<SpringJoint>().connectedAnchor = new Vector3(-5 + i * 2, 5.5f, 0);
            }

            if (con.insultViewObject) {
                var r = con.insultViewObject.GetComponent<RectTransform>();
                var r2 = con.insultViewObject.GetComponentInChildren<Text>().rectTransform;

                r.sizeDelta = new Vector2(0, Mathf.Min(r2.rect.height + 10, 100));
            }

            string text = con.name;
            if (insulting) {
                if (curJudge == i) {
                    text += "\njudge";
                } else if (con.receivedInsult != null) {
                    text += "\nready!";
                } else {
                    text += "\nthinking...";
                }
            }

            text += "\nwins: " + con.wins;

            con.iconObject.GetComponentInChildren<TextMesh>().text = text;
        }

        if (!insulting && !voting && !roundOver) {
            insultExpiration.Set();
        }

        if (insulting) {
            timer.text = ((int)insultExpiration.remaining) + "";
            if (insultExpiration.expired || AllInsultsIn()) {
                insulting = false;
                voting = true;
                voteExpiration.Set();

                foreach (var c in connectedPlayers) {
                    if (c.receivedInsult != null && c.receivedInsult.Length > 0) {
                        var t = Instantiate(insultViewPrefab).GetComponent<RectTransform>();
                        var t2 = t.GetComponentInChildren<Text>();
                        t2.text = c.receivedInsult + "\n\t-" + c.name;

                        InsultStacc.inst.Push(t);
                        c.insultViewObject = t.gameObject;
                    }
                }
            }
        } else if (voting) {
            timer.text = ((int)voteExpiration.remaining) + "";
            if (voteExpiration.expired || AllVotesIn()) {
                voting = false;
                roundOver = true;
                endExpiration.Set();
            }
        } else if (roundOver) {
            timer.text = ((int)endExpiration.remaining) + "";

            if (winner != null && winner.insultViewObject != null) {
                winner.insultViewObject.GetComponent<Image>().color = Color.green;
            }

            if (endExpiration.expired) {
                InsultStacc.inst.Clear();
                NextRound();
            }
        }
    }
}
