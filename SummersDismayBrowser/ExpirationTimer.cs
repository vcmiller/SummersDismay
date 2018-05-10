
using System;

namespace SBR {
    public class ExpirationTimer {
        public float expiration { get; set; }
        public float lastSet { get; set; }

        private float curTime {
            get {
                return Time.time;
            }
        }

        public bool expired {
            get {
                return curTime >= lastSet + expiration;
            }
        }

        public float remaining {
            get {
                return Math.Max(0, expiration - (curTime - lastSet));
            }
        }

        public float remainingRatio {
            get {
                if (expired) {
                    return 0;
                } else {
                    return 1 - ((curTime - lastSet) / expiration);
                }
            }
        }

        public ExpirationTimer(float expiration) {
            this.expiration = expiration;
            Clear();
        }

        public void Set() {
            lastSet = curTime;
        }

        public void Clear() {
            lastSet = curTime - expiration;
        }
    }
}