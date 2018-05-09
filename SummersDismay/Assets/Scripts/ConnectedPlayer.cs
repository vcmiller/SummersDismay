﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using UnityEngine;
using SBR;

public class ConnectedPlayer {
    private static int curID = 1;
    private static System.Random random = new System.Random();
    private static HashSet<long> usedIds = new HashSet<long>();
    
    public string name { get; private set; }
    public PlayerIcon iconObject;
    public GameObject insultViewObject;
    public string receivedInsult;
    public int wins;
    public bool left;
    public ExpirationTimer timeout;
    public bool keepAlive;
    public int id;
    public long privateId;

    public ConnectedPlayer(string namee) {
        this.name = name;
        this.id = curID++;

        do {
            privateId = LongRandom();
        } while (!usedIds.Add(privateId));
    }

    private static long LongRandom() {
        long high = random.Next();
        long low = random.Next();
        return (high << 32) | low;
    }
}
