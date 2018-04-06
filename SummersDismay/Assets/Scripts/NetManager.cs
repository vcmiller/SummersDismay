using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class NetManager : NetworkManager {
    public override void OnServerConnect(NetworkConnection conn) {

        print("Hello m80");
    }
    
}
