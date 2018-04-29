using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using UnityEngine;
using SBR;

public class ConnectedPlayer {
    private static int curID = 1;
    
    public string name { get; private set; }
    public IPAddress remote { get; private set; }
    public PlayerIcon iconObject;
    public GameObject insultViewObject;
    public string receivedInsult;
    public int wins;
    public bool left;
    public ExpirationTimer timeout;
    public bool keepAlive;
    public int id;

    public ConnectedPlayer(string name, IPAddress remote) {
        this.name = name;
        this.remote = remote;
        this.id = curID++;
    }
}
