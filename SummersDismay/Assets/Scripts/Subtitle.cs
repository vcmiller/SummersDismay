using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using SBR;
using System.Text.RegularExpressions;

public class Subtitle : MonoBehaviour {
    public TextAsset subtitles;

    private Text text;
    private ExpirationTimer changeTimer;
    private List<string> lines;
    private int lineNum;

    // Use this for initialization
    void Start () {
        changeTimer = new ExpirationTimer(2);
        text = GetComponent<Text>();
        lines = new List<string>();
        lineNum = 0;

        foreach (var line in subtitles.text.Split('\n')) {
            var l = line.Trim();
            if (l.Length > 0 && !Regex.IsMatch(l, @"^\d+")) {
                lines.Add(l);
            }
        }
	}
	
	// Update is called once per frame
	void Update () {
		if (changeTimer.expired) {
            changeTimer.Set();

            text.text = lines[lineNum];
            lineNum = (lineNum + 1) % lines.Count;
        }
	}
}
