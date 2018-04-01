using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using UnityEngine;

public class ConnectedPlayer {
    public string name { get; private set; }
    public IPAddress remote { get; private set; }
    public GameObject iconObject;
    public GameObject insultViewObject;
    public string receivedInsult;
    public int wins;

    public ConnectedPlayer(string name, IPAddress remote) {
        this.name = name;
        this.remote = remote;
    }
}
