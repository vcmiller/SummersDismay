using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace SBR.Editor {
    public class Magazine {
        public int capacity { get; set; }
        public int remaining { get; set; }
        public float reloadTime {
            get {
                return reloadTimer.expiration;
            }

            set {
                reloadTimer.expiration = value;
            }
        }

        private bool reloading;
        private ExpirationTimer reloadTimer;

        public Magazine(int capacity, float reload) {
            remaining = this.capacity = capacity;
            reloadTimer = new ExpirationTimer(reload);
        }

        public bool Use() {
            if (reloading && reloadTimer.expired) {
                remaining = capacity;
            }

            if (remaining > 0) {
                remaining--;

                if (remaining == 0) {
                    reloading = true;
                    reloadTimer.Set();
                }

                return true;
            } else {
                return false;
            }
        }
    }
}