using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using SBR;

public class PlayerIcon : MonoBehaviour {

    private Sprite mainTex;
    private Sprite altTex;

    private Image image;
    private Animator anim;
    
    private ExpirationTimer expressionExpiration;

	// Use this for initialization
	void Awake () {
        expressionExpiration = new ExpirationTimer(10);
        image = GetComponent<Image>();
        anim = GetComponent<Animator>();
	}

    public void Init(Sprite mainTex, Sprite altTex) {
        this.mainTex = mainTex;
        this.altTex = altTex;
    }
	
	// Update is called once per frame
	void Update () {
        var joint = GetComponent<SpringJoint>();
        
        if (mainTex && altTex) {
            image.sprite = expressionExpiration.expired ? mainTex : altTex;
        }
	}

    public void Win() {
        anim.SetTrigger("Win");
    }

    public void Leave() {
        anim.Play("PlayerLeave");
    }

    public void SetSubmitted(bool value) {
        anim.SetBool("Submitted", value);
    }

    public void Express() {
        expressionExpiration.Set();
    }
}
