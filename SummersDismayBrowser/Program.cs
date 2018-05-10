using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SummersDismayBrowser {
    class Program {
        static void Main(string[] args) {
            Time.Init();

            if (args.Length > 0) {
                new Server(Convert.ToInt32(args[0]));
            } else {
                new Server(12345);
            }

            GameManagerManager.RunUpdateThread();
        }
    }
}
