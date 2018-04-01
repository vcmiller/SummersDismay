using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class InsultStacc : MonoBehaviour {
    public static InsultStacc inst { get; private set; }

    private float h;
    private Queue<RectTransform> top;

    public float speed = 700;

	// Use this for initialization
	void Awake () {
        top = new Queue<RectTransform>();
        inst = this;
	}

    public void Clear() {
        for (int i = 0; i < transform.childCount; i++) {
            Destroy(transform.GetChild(i).gameObject);
        }
        top.Clear();
        h = 0;
    }
	
	public void Push(RectTransform rect) {
        top.Enqueue(rect);
        rect.SetParent(transform, false);
        rect.anchoredPosition = new Vector2(0, -GetComponent<RectTransform>().rect.height);
    }

    private void Update() {
        if (top.Count > 0) {
            var t = top.Peek();
            t.anchoredPosition += Vector2.up * speed * Time.deltaTime;
            if (t.anchoredPosition.y >= h) {
                t.anchoredPosition = new Vector2(0, h);
                h -= t.rect.height;
                top.Dequeue();
            }
        }
    }
}
