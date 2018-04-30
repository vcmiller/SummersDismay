﻿using System;
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

public class GameManagerOld : MonoBehaviour {
    public int curJudge { get; private set; }
    public static GameManagerOld inst { get; private set; }

    public GameObject playerIconPrefab;
    public GameObject insultViewPrefab;
    public Button startGameButton;

    public MultiSound joinSound;
    public MultiSound shockSound;
    public MultiSound winSound;

    private int nextIcon;
    private ConnectedPlayer winner;
    private bool voting, insulting, roundOver;
    private ExpirationTimer insultExpiration;
    private ExpirationTimer voteExpiration;
    private ExpirationTimer endExpiration;

    public Sprite[] icons;
    public Sprite[] expr;
    public Text timer;

    public List<ConnectedPlayer> connectedPlayers { get; private set; }

    private void Awake() {
        connectedPlayers = new List<ConnectedPlayer>();
        inst = this;

        insultExpiration = new ExpirationTimer(60);
        voteExpiration = new ExpirationTimer(30);
        endExpiration = new ExpirationTimer(5);
    }

    public void StartGame() {
        if (!(insulting || voting || roundOver)) {
            timer.gameObject.SetActive(true);
            insulting = true;
        }
    }

    public static string ToRoman(int number) {
        if ((number < 0) || (number > 3999)) throw new ArgumentOutOfRangeException("insert value betwheen 1 and 3999");
        if (number < 1) return string.Empty;
        if (number >= 1000) return "M" + ToRoman(number - 1000);
        if (number >= 900) return "CM" + ToRoman(number - 900);
        if (number >= 500) return "D" + ToRoman(number - 500);
        if (number >= 400) return "CD" + ToRoman(number - 400);
        if (number >= 100) return "C" + ToRoman(number - 100);
        if (number >= 90) return "XC" + ToRoman(number - 90);
        if (number >= 50) return "L" + ToRoman(number - 50);
        if (number >= 40) return "XL" + ToRoman(number - 40);
        if (number >= 10) return "X" + ToRoman(number - 10);
        if (number >= 9) return "IX" + ToRoman(number - 9);
        if (number >= 5) return "V" + ToRoman(number - 5);
        if (number >= 4) return "IV" + ToRoman(number - 4);
        if (number >= 1) return "I" + ToRoman(number - 1);
        throw new ArgumentOutOfRangeException("something bad happened");
    }

    public void HandleNewConnection(HttpListenerContext context) {
        string name = context.Request.QueryString.Get("name");

        if (name != null) {
            name = name.Trim();
            if (name.Length > 24) {
                name = name.Substring(0, 24);
            } else if (name.Length == 0) {
                name = "blank";
            }

            if (GetPlayerInfo(context.Request.RemoteEndPoint.Address) == null) {
                int i = 2;

                var actName = name;
                while (GetPlayerInfo(actName) != null) {
                    actName = name + " " + ToRoman(i);
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

            playerInfo.keepAlive = true;

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
                    if (payload.leaving) {
                        playerInfo.left = true;
                    }

                    if (!isJudge && insulting && (playerInfo.receivedInsult == null || playerInfo.receivedInsult.Length == 0)) {
                        playerInfo.receivedInsult = payload.insult;
                    } else if (isJudge && voting && winner == null && payload.vote > 0) {
                        winner = GetPlayerInfo(payload.vote);
                        winner.wins++;
                    }
                }
            } catch (Exception ex) {
                UnityEngine.Debug.Log(ex);
            }

            response.insulted = playerInfo.receivedInsult != null && playerInfo.receivedInsult.Length > 0;
        }

        response.running = insulting || voting || roundOver;

        if (insulting) {

        } else if (voting) {
            response.insults = GetInsultsArray();
        } else if (roundOver) {
            response.insults = GetInsultsArray();

            if (winner == null) {
                do {
                    winner = connectedPlayers[new System.Random().Next(connectedPlayers.Count)];
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
        InsultStacc.inst.Clear();
        insultExpiration.Set();

        if (connectedPlayers.Count > 0) {
            curJudge = (curJudge + 1) % connectedPlayers.Count;
        } else {
            curJudge = 0;
        }
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
                ins.casterID = p.id;
                insults.Add(ins);
            }
        }

        return insults.ToArray();
    }

    [Serializable]
    public class UpdatePayload {
        public string insult;
        public int vote;
        public bool leaving;
    }

    [Serializable]
    public class UpdateResponse {
        public string name;
        public int role;
        public string judge;
        public bool insulted;
        public bool voted;
        public bool running;
        public Insult[] insults;
        public Insult winner;
    }

    [Serializable]
    public class Insult {
        public string caster;
        public int casterID;
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

    public ConnectedPlayer GetPlayerInfo(int id) {
        foreach (var info in connectedPlayers) {
            if (info.id == id) {
                return info;
            }
        }

        return null;
    }

    public void QuitButton() {
        if (insulting || voting || roundOver) {
            NextRound();
            curJudge = 0;

            insulting = false;
            timer.gameObject.SetActive(false);

            foreach (var p in connectedPlayers) {
                p.wins = 0;
            }
        } else {
            Application.Quit();
        }
    }

    private void Update() {
        startGameButton.interactable = !(insulting || voting) && connectedPlayers.Count > 1;

        for (int i = 0; i < connectedPlayers.Count; i++) {
            var con = connectedPlayers[i];

            if (con.timeout == null) {
                con.timeout = new ExpirationTimer(10);
                con.timeout.Set();
            }

            if (con.keepAlive) {
                con.timeout.Set();
                con.keepAlive = false;
            }

            while (con.left || con.timeout.expired) {
                con.iconObject.Leave();
                Destroy(con.iconObject.transform.parent.gameObject, 10);

                connectedPlayers.RemoveAt(i);

                for (int j = i; j < connectedPlayers.Count; j++) {
                    connectedPlayers[j].iconObject.transform.parent.GetComponent<RectTransform>().anchoredPosition += Vector2.left * 100;
                }

                if (i == curJudge || connectedPlayers.Count < 2) {
                    curJudge--;
                    NextRound();

                    insulting = connectedPlayers.Count > 1;
                    timer.gameObject.SetActive(false);
                    return;
                } else if (i < connectedPlayers.Count - 1) {
                    con = connectedPlayers[i];

                    if (curJudge > i) {
                        curJudge--;
                    }
                } else {
                    break;
                }
            }

            if (con == null) {
                continue;
            }

            if (!con.iconObject) {
                var obj = Instantiate(playerIconPrefab, new Vector2(0, -7), Quaternion.Euler(0, 0, 0)).GetComponent<RectTransform>();
                con.iconObject = obj.GetComponentInChildren<PlayerIcon>();
                con.iconObject.Init(icons[nextIcon], expr[nextIcon]);
                obj.SetParent(FindObjectOfType<Canvas>().transform, false);
                obj.anchoredPosition = new Vector2(-300 + 100 * i, 0);
                joinSound.Play();

                nextIcon = (nextIcon + 1) % icons.Length;
            }

            if (con.insultViewObject) {
                var r = con.insultViewObject.GetComponent<RectTransform>();
                var r2 = con.insultViewObject.GetComponentInChildren<Text>().rectTransform;

                r.sizeDelta = new Vector2(0, r2.rect.height + 10);
            }

            string text = con.name;
            if (insulting) {
                if (curJudge == i) {
                    text += "\nvictim";
                } else if (con.receivedInsult != null) {
                    text += "\nready!";
                } else {
                    text += "\nthinking...";
                }
            }

            if (con.wins > 0) {
                text += "\nwins: " + con.wins;
            }

            con.iconObject.GetComponentInChildren<Text>().text = text;

            con.iconObject.SetSubmitted(con.receivedInsult != null && con.receivedInsult.Length > 0);
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
                connectedPlayers[curJudge].iconObject.Express();
                shockSound.Play();

                foreach (var c in connectedPlayers) {
                    if (c.receivedInsult != null && c.receivedInsult.Length > 0) {
                        var t = Instantiate(insultViewPrefab).GetComponent<RectTransform>();
                        var t2 = t.GetComponentInChildren<Text>();
                        t2.text = c.receivedInsult;

                        if (t2.text.Length > 300) {
                            t2.text = t2.text.Substring(0, 300) + "...";
                        }

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

                if (winner != null) {
                    winner.iconObject.Win();
                    winSound.Play();
                }
            }
        } else if (roundOver) {
            timer.text = ((int)endExpiration.remaining) + "";

            if (winner != null && winner.insultViewObject != null) {
                winner.insultViewObject.GetComponent<Image>().color = Color.green;
            }

            if (endExpiration.expired) {
                NextRound();
            }
        }
    }
}