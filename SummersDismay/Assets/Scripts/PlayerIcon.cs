using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerIcon : MonoBehaviour {
    private LineRenderer line;

	// Use this for initialization
	void Start () {
        line = GetComponent<LineRenderer>();
	}
	
	// Update is called once per frame
	void Update () {
        line.SetPosition(0, transform.position);
        line.SetPosition(1, GetComponent<SpringJoint>().connectedAnchor);
	}
}
