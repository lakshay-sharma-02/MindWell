import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { BadgeCollection } from "@/components/gamification/BadgeCollection";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";

export default function Badges() {
  return (
    <Layout>
      <SEOHead
        title="Badge Collection | MindWell"
        description="View your earned badges and unlock achievements on your wellness journey"
      />

      <div className="container-wide py-24 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4"
            >
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-display font-bold">Badge Collection</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Track your achievements and unlock badges as you progress on your mental wellness journey
            </p>
          </div>

          {/* Badge Collection Component */}
          <BadgeCollection />
        </motion.div>
      </div>
    </Layout>
  );
}
