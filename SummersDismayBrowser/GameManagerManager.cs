using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Concurrent;
using SBR;

using Game = System.Tuple<string, int, SBR.ExpirationTimer, SummersDismayBrowser.GameManager>;

namespace SummersDismayBrowser {
    public static class GameManagerManager {

        private static Random rand = new Random();

        private static ConcurrentDictionary<int, bool> usedIds = new ConcurrentDictionary<int, bool>();
        private static ConcurrentDictionary<string, Game> games = new ConcurrentDictionary<string, Game>();

        public const float serverExpiration = 20;
        
        private static void ClearExpiredAddrs() {
            long t = Time.rawMillis;

            List<string> toRemove = new List<string>();

            foreach (var entry in games) {
                if (entry.Value.Item3.expired) {
                    toRemove.Add(entry.Key);
                }
            }

            foreach (var entry in toRemove) {
                Game l;
                games.TryRemove(entry, out l);
                bool b;
                usedIds.TryRemove(l.Item2, out b);

                Console.WriteLine("Dropped Game: " + l);
            }
        }

        private static string GetRoomCode() {
            string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            Random r = new Random();

            string code = "";
            do {
                for (int i = 0; i < 4; i++) {
                    code += alphabet[r.Next(alphabet.Length)];
                }
            } while (games.ContainsKey(code));

            return code;
        }

        private static int GetId() {
            int id;

            do {
                id = rand.Next();
            } while (usedIds.ContainsKey(id));

            usedIds[id] = true;
            return id;
        }

        public static Game CreateGame() {
            string code = GetRoomCode();
            ExpirationTimer timer = new ExpirationTimer(serverExpiration);
            timer.Set();
            GameManager manager = new GameManager();
            int id = GetId();

            games[code] = Tuple.Create(code, id, timer, manager);
            return games[code];
        }

        public static void KeepAlive(int id) {
            var game = GetGame(id);
            if (game != null) {
                game.Item3.Set();
            }
        }

        public static Game GetGame(int id) {
            if (usedIds.ContainsKey(id)) {
                foreach (var game in games) {
                    if (game.Value.Item2 == id) {
                        return game.Value;
                    }
                }
            }

            return null;
        }

        public static GameManager GetGame(string code) {
            if (games.ContainsKey(code)) {
                return games[code].Item4;
            } else {
                return null;
            }
        }

        public static void RunUpdateThread() {
            new Thread(UpdateThreadBody).Start();
        }

        private static void UpdateThreadBody() {
            while (true) {
                Time.Tick();

                ClearExpiredAddrs();

                foreach (var game in games) {
                    try {
                        game.Value.Item4.StartGame();
                        game.Value.Item4.Update();
                    } catch (Exception ex) {
                        Console.WriteLine(ex);
                    }
                }

                Thread.Sleep(100);
            }
        }
    }
}
