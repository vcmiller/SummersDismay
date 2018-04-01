﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SBR;

public class PlayerIcon : MonoBehaviour {
    private LineRenderer line;

    private Texture mainTex;
    private Texture altTex;

    private Material mat;
    private ExpirationTimer expressionExpiration;

	// Use this for initialization
	void Start () {
        line = GetComponent<LineRenderer>();
        expressionExpiration = new ExpirationTimer(10);
        mat = GetComponent<MeshRenderer>().material;
	}

    public void Init(Texture mainTex, Texture altTex) {
        this.mainTex = mainTex;
        this.altTex = altTex;
    }
	
	// Update is called once per frame
	void Update () {
        var joint = GetComponent<SpringJoint>();

        if (joint) {
            line.SetPosition(0, transform.position);
            line.SetPosition(1, joint.connectedAnchor);
            line.enabled = true;
        } else {
            line.enabled = false;
        }

        if (mainTex && altTex) {
            mat.mainTexture = expressionExpiration.expired ? mainTex : altTex;
        }
	}

    public void Express() {
        expressionExpiration.Set();
    }
}
