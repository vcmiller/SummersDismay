using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class MultiSound : MonoBehaviour {
    public AudioClip[] clips;
    private AudioSource src;

    public bool PlayAutomatically = false;

    private void Start() {
        src = GetComponent<AudioSource>();

        if (PlayAutomatically) {
            Play();
        }
    }

    public void Play() {
        src.clip = clips[Random.Range(0, clips.Length)];
        src.Play();
    }
}
