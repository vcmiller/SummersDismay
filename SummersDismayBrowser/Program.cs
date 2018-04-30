using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SummersDismayBrowser {
    class Program {
        static void Main(string[] args) {
            if (args.Length > 0) {
                new SimpleHTTPServer(Convert.ToInt32(args[0]));
            } else {
                new SimpleHTTPServer(12345);
            }
        }
    }
}
