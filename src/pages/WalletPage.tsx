import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  created_at: string;
}

const WalletPage = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;

      // Fetch or create wallet
      let { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        // Create wallet if doesn't exist
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0 })
          .select('id, balance')
          .single();
        wallet = newWallet;
      }

      if (wallet) {
        setBalance(Number(wallet.balance));

        // Fetch transactions
        const { data: txns } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', wallet.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (txns) {
          setTransactions(txns as WalletTransaction[]);
        }
      }

      setLoading(false);
    };

    fetchWalletData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Please sign in</h1>
          <Link to="/auth" className="text-primary hover:underline font-accent">Sign In →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
              My Wallet
            </h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-accent text-sm opacity-80">Available Balance</p>
                  <p className="font-heading text-3xl font-bold">
                    {loading ? '...' : `₹${balance.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <p className="font-accent text-xs opacity-70">
                Use your wallet balance at checkout for instant discounts
              </p>
            </div>

            {/* How it works */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-8">
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">How Store Credits Work</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-accent text-sm font-medium text-foreground">Earn Credits</p>
                    <p className="font-accent text-xs text-muted-foreground">
                      Get store credits from returns, referrals, and promotional campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-accent text-sm font-medium text-foreground">Use Credits</p>
                    <p className="font-accent text-xs text-muted-foreground">
                      Apply your balance at checkout to reduce your total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-heading text-lg font-bold text-foreground">Transaction History</h2>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="font-accent text-muted-foreground">Loading...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-accent text-muted-foreground">No transactions yet</p>
                  <p className="font-accent text-xs text-muted-foreground mt-1">
                    Your wallet transactions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          txn.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {txn.type === 'credit' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-accent text-sm font-medium text-foreground">
                            {txn.description || (txn.type === 'credit' ? 'Credit Added' : 'Credit Used')}
                          </p>
                          <p className="font-accent text-xs text-muted-foreground">
                            {format(new Date(txn.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-accent text-sm font-bold ${
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{Math.abs(txn.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WalletPage;
