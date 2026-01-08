import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Zap,
  MessageSquare,
  Download,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { track } from '@/lib/analytics';

const features = [
  {
    icon: BarChart3,
    title: '15 Chart Types',
    description: 'Bar, line, pie, scatter, heatmap, waterfall, and more',
  },
  {
    icon: Zap,
    title: 'Instant Previews',
    description: 'See your dashboard in seconds, not hours',
  },
  {
    icon: Download,
    title: 'Power BI Ready',
    description: 'Export directly to Power BI format',
  },
  {
    icon: MessageSquare,
    title: 'Chat Refinement',
    description: 'Refine with natural language commands',
  },
];

const testimonials = [
  {
    quote: 'Finally, BI without DAX!',
    author: 'Every Analyst',
    role: 'Data Professional',
  },
  {
    quote: 'Created my first dashboard in 30 seconds',
    author: 'Power BI User',
    role: 'Business Analyst',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    track.featureUsed('landing_cta_clicked');
    navigate('/');
  };

  const handleWatchDemo = () => {
    track.featureUsed('landing_demo_clicked');
    // For now, navigate to app with demo data
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Dashboard Generator
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Create{' '}
            <span className="text-gradient">Power BI Dashboards</span>
            <br />
            from{' '}
            <span className="relative">
              Plain English
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload your data, describe what you want, and get a ready-to-export
            Power BI dashboard in seconds. No DAX. No formulas. Just results.
          </p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Live Demo
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWatchDemo}
              className="px-8 py-6 text-lg rounded-xl border-border/50 hover:bg-secondary"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch 30s Demo
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs font-medium">{i}</span>
                  </div>
                ))}
              </div>
              <span>Used by analysts worldwide</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-warning text-warning"
                />
              ))}
              <span className="ml-1">Built for Microsoft Hackathon</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Image/Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-50" />

            {/* Dashboard preview mock */}
            <div className="relative glass-panel p-6 rounded-2xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 h-6 bg-muted/30 rounded-lg flex items-center px-3">
                  <span className="text-xs text-muted-foreground">
                    promptbi.app
                  </span>
                </div>
              </div>

              {/* Mock dashboard grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Mock charts */}
                <div className="col-span-2 h-40 bg-muted/20 rounded-xl border border-border/30 flex items-end p-4 gap-2">
                  {[60, 85, 45, 95, 70, 80, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
                <div className="h-40 bg-muted/20 rounded-xl border border-border/30 flex items-center justify-center">
                  <motion.div
                    className="w-24 h-24 rounded-full border-8 border-primary/30"
                    style={{
                      borderRightColor: 'hsl(var(--primary))',
                      borderTopColor: 'hsl(var(--primary))',
                    }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ delay: 1, duration: 1.5 }}
                  />
                </div>
                <div className="h-24 bg-muted/20 rounded-xl border border-border/30 p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Revenue
                  </div>
                  <motion.div
                    className="text-2xl font-bold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    $1.2M
                  </motion.div>
                </div>
                <div className="h-24 bg-muted/20 rounded-xl border border-border/30 p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Growth Rate
                  </div>
                  <motion.div
                    className="text-2xl font-bold text-success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    +24%
                  </motion.div>
                </div>
                <div className="h-24 bg-muted/20 rounded-xl border border-border/30 p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Active Users
                  </div>
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    8,421
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-muted/5">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to build dashboards
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features that make dashboard creation effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to your perfect dashboard
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Data',
                description:
                  'Drop your CSV or Excel file. We detect your schema automatically.',
              },
              {
                step: '2',
                title: 'Describe What You Want',
                description:
                  'Tell the AI in plain English what dashboard you need.',
              },
              {
                step: '3',
                title: 'Export to Power BI',
                description:
                  'Get a ready-to-use Power BI file. No DAX required!',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>

                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 bg-muted/5">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What users say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-6 rounded-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="text-lg mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to create your first dashboard?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              No sign-up required. Just upload and go.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                No sign-up required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Export unlimited dashboards
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for Microsoft Hackathon • Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
