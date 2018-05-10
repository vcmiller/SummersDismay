using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public class Time {
    private static double start;
    private static double current;

    public static void Init() {
        start = rawSeconds;
        current = start;
    }

    public static void Tick() {
        current = rawSeconds;
    }

    public static long rawMillis {
        get {
            return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }
    }

    public static double rawSeconds {
        get {
            return rawMillis / 1000.0;
        }
    }

    public static float time {
        get {
            return (float)(current - start);
        }
    }
}

