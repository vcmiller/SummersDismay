using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SBR;

[RequireComponent(typeof(AudioSource))]
public class MultiSound : MonoBehaviour {
    public AudioClip[] clips;
    private AudioSource src;
    private int curIndex;

    public float fadeAfter = -1;
    private ExpirationTimer fadeTimer;

    public bool PlayAutomatically = false;

    private void Start() {
        src = GetComponent<AudioSource>();
        if (fadeAfter > 0) {
            fadeTimer = new ExpirationTimer(fadeAfter);
        }

        if (PlayAutomatically) {
            Play();
        }
    }

    public void Play() {
        curIndex = Random.Range(0, clips.Length);
        src.clip = clips[curIndex];
        src.Play();

        if (fadeTimer != null) {
            fadeTimer.Set();
        }
    }

    private void Update() {
        if (fadeTimer != null && fadeTimer.expired) {
            fadeTimer.Set();

            StartCoroutine(FadeTo());
        }
    }

    IEnumerator FadeTo() {
        float start = Time.time;
        float startVol = src.volume;
        while (Time.time - start < 1) {
            src.volume = Mathf.Lerp(startVol, 0, Time.time - start);
            yield return null;
        }
        curIndex = (curIndex + 1) % clips.Length;
        src.clip = clips[curIndex];
        src.Play();
        start = Time.time;
        while (Time.time - start < 1) {
            src.volume = Mathf.Lerp(0, startVol, Time.time - start);
            yield return null;
        }
    }
}
