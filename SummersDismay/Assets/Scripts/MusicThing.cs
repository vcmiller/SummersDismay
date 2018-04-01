using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MusicThing : MonoBehaviour {
    public AudioClip[] clips;

	// Use this for initialization
	void Start () {
        GetComponent<AudioSource>().clip = clips[Random.Range(0, clips.Length)];
        GetComponent<AudioSource>().Play();
	}
}
