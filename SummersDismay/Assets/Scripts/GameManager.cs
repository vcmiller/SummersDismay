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

public class GameManager : GameManagerSM {
    public int curJudge { get; private set; }
    public static GameManager inst { get; private set; }

    public GameObject playerIconPrefab;
    public GameObject insultViewPrefab;
    public Button startGameButton;

    public MultiSound joinSound;
    public MultiSound shockSound;
    public MultiSound winSound;

    private int nextIcon;
    private ConnectedPlayer winner;
    private bool startSignal;
    private bool quitSignal;

    private long timerStart;
    private int timerLength;

    private ExpirationTimer insultExpiration;
    private ExpirationTimer voteExpiration;
    private ExpirationTimer endExpiration;

    public Sprite[] icons;
    public Sprite[] expr;
    public Text timer;

    public List<ConnectedPlayer> connectedPlayers { get; private set; }

    public void Awake() {
        Initialize();
        enabled = true;

        connectedPlayers = new List<ConnectedPlayer>();
        inst = this;

        insultExpiration = new ExpirationTimer(60);
        voteExpiration = new ExpirationTimer(30);
        endExpiration = new ExpirationTimer(5);
    }

    void Update() {
        GetInput();
    }

    public void StartGame() {
        startSignal = true;
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

        if (!string.IsNullOrEmpty(name)) {
            name = name.Trim();
            if (name.Length > 24) {
                name = name.Substring(0, 24);
            } else if (name.Length == 0) {
                name = "blank";
            }
            
            int i = 2;

            var actName = name;
            while (GetPlayerInfo(actName) != null) {
                actName = name + " " + ToRoman(i);
            }

            var con = new ConnectedPlayer(actName);

            connectedPlayers.Add(con);

            ServerManager.inst.server.WriteTextToContext(context, con.privateId.ToString());
        } else {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
    }

    public void HandleUpdate(HttpListenerContext context) {
        UpdatePayload payload = null;

        try {
            var strm = context.Request.InputStream;
            var reader = new StreamReader(strm, context.Request.ContentEncoding);
            string json = reader.ReadToEnd();
            payload = JsonUtility.FromJson<UpdatePayload>(json);
        } catch (Exception ex) {
            UnityEngine.Debug.Log(ex);
        }

        if (payload != null) {
            var response = new UpdateResponse();
            var playerInfo = GetPlayerInfo(payload.privateId);

            response.timerStart = timerStart;
            response.timerLength = timerLength;

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
                    
                if (payload.leaving) {
                    playerInfo.left = true;
                }

                if (!isJudge && state == StateID.Insulting && (playerInfo.receivedInsult == null || playerInfo.receivedInsult.Length == 0)) {
                    playerInfo.receivedInsult = WWW.UnEscapeURL(payload.insult);
                } else if (isJudge && state == StateID.Voting && winner == null && payload.vote > 0) {
                    winner = GetPlayerInfo(payload.vote);
                    winner.wins++;
                }

                response.insulted = playerInfo.receivedInsult != null && playerInfo.receivedInsult.Length > 0;
            }

            response.running = state != StateID.Waiting;

            if (state == StateID.Insulting) {

            } else if (state == StateID.Voting) {
                response.insults = GetInsultsArray();
            } else if (state == StateID.PostGame) {
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
        } else {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
    }

    private long TimeMilliseconds() {
        return (long)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
    }

    protected override void State_Waiting() {
        startGameButton.interactable = connectedPlayers.Count >= 2;
        curJudge = 0;
    }

    protected override bool TransitionCond_Waiting_Insulting() {
        return startSignal && connectedPlayers.Count >= 2;
    }

    protected override bool TransitionCond_Running_Waiting() {
        return quitSignal || connectedPlayers.Count < 2;
    }

    protected override void StateEnter_Running() {
        startGameButton.interactable = false;
        timer.gameObject.SetActive(true);
        startSignal = false;
    }

    protected override void State_Running() {
        if (quitSignal) return;

        foreach (var con in connectedPlayers) {
            string text = con.name;

            if (connectedPlayers[curJudge] == con) {
                text += "\nvictim";
            } else if (con.receivedInsult != null) {
                text += "\nready!";
            } else {
                if (state == StateID.Insulting) {
                    text += "\nthinking...";
                } else {
                    text += "\nnot feeling mean";
                }
            }
            
            if (con.wins > 0) {
                text += "\nwins: " + con.wins;
            }

            con.iconObject.GetComponentInChildren<Text>().text = text;
        }
    }

    protected override void StateExit_Running() {
        timer.gameObject.SetActive(false);
        quitSignal = false;

        foreach (var con in connectedPlayers) {
            con.iconObject.GetComponentInChildren<Text>().text = con.name;
        }
    }

    protected override void StateEnter_Insulting() {
        foreach (var c in connectedPlayers) {
            c.receivedInsult = null;
        }

        winner = null;
        InsultStacc.inst.Clear();
        insultExpiration.Set();
        timerStart = TimeMilliseconds();
        timerLength = (int)(insultExpiration.expiration * 1000);

        if (connectedPlayers.Count > 0) {
            curJudge = (curJudge + 1) % connectedPlayers.Count;
        } else {
            curJudge = 0;
        }
    }

    protected override void State_Insulting() {
        if (quitSignal) return;

        timer.text = ((int)insultExpiration.remaining).ToString();
    }

    protected override bool TransitionCond_Insulting_Voting() {
        if (insultExpiration.expired) {
            return true;
        }

        for (int i = 0; i < connectedPlayers.Count; i++) {
            var p = connectedPlayers[i];
            if (i != curJudge && (p.receivedInsult == null || p.receivedInsult.Length == 0)) {
                return false;
            }
        }

        return true;
    }

    protected override void StateEnter_Voting() {
        voteExpiration.Set();
        timerStart = TimeMilliseconds();
        timerLength = (int)(voteExpiration.expiration * 1000);

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

    protected override void State_Voting() {
        if (quitSignal) return;

        timer.text = ((int)voteExpiration.remaining).ToString();

        foreach (var con in connectedPlayers) {
            if (con.insultViewObject) {
                var r = con.insultViewObject.GetComponent<RectTransform>();
                var r2 = con.insultViewObject.GetComponentInChildren<Text>().rectTransform;

                r.sizeDelta = new Vector2(0, r2.rect.height + 10);
            }
        }
    }

    protected override bool TransitionCond_Voting_PostGame() {
        if (voteExpiration.expired) {
            return true;
        }

        return winner != null;
    }

    protected override void StateEnter_PostGame() {
        endExpiration.Set();
        timerStart = TimeMilliseconds();
        timerLength = (int)(endExpiration.expiration * 1000);

        if (winner != null) {
            winner.iconObject.Win();
            winSound.Play();

            if (winner.insultViewObject != null) {
                winner.insultViewObject.GetComponent<Image>().color = Color.green;
            }
        }
    }

    protected override void State_PostGame() {
        timer.text = ((int)endExpiration.remaining).ToString();
    }

    protected override bool TransitionCond_PostGame_Insulting() {
        return endExpiration.expired;
    }

    [Serializable]
    public class UpdatePayload {
        public string insult;
        public int vote;
        public bool leaving;
        public long privateId;
    }

    [Serializable]
    public class UpdateResponse {
        public string name;
        public int role;
        public string judge;
        public bool insulted;
        public bool voted;
        public bool running;
        public long timerStart;
        public int timerLength;
        public Insult[] insults;
        public Insult winner;
    }

    [Serializable]
    public class Insult {
        public string caster;
        public int casterID;
        public string content;
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

    public ConnectedPlayer GetPlayerInfo(long privateId) {
        foreach (var info in connectedPlayers) {
            if (info.privateId == privateId) {
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
        if (state == StateID.Waiting) {
            Application.Quit();
        } else {
            quitSignal = true;
        }
    }

    public override void GetInput() {

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

                if (state != StateID.Waiting && i == curJudge) {
                    quitSignal = true;
                    startSignal = true;
                    base.GetInput();
                    return;
                } else if (i < connectedPlayers.Count - 1) {
                    con = connectedPlayers[i];

                    if (curJudge > i) {
                        curJudge--;
                    }
                } else {
                    con = null;
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
                con.iconObject.GetComponentInChildren<Text>().text = con.name;
                obj.SetParent(FindObjectOfType<Canvas>().transform, false);
                obj.anchoredPosition = new Vector2(-300 + 100 * i, 0);
                joinSound.Play();

                nextIcon = (nextIcon + 1) % icons.Length;
            }
            
            con.iconObject.SetSubmitted(con.receivedInsult != null && con.receivedInsult.Length > 0);
        }

        base.GetInput();
    }


}
