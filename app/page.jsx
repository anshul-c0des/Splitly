import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURES, STEPS, TESTIMONIALS } from "@/lib/landing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col pt-16">
      <section className="mt-20 pb-12 space-y-10 md:space-y-20 px-5">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <Badge variant="outiline" className="bg-orange-100 text-orange-600">Split Expenses,Smartly!</Badge>

          <h1 className="gradient-title mx-auto max-w-4xl text-4xl font-bold md:text-6xl">The modern way to manage shared expenses with friends.</h1>

          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">Keep track of shared expenses, split costs with ease, and settle up in seconds—no more confusion over who owes what</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size={'lg'} className="bg-orange-600 hover:bg-orange-700 transition">
                <Link href="/dashboard">Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </Button>
            <Button asChild variant='outline' size={'lg'} className="border-orange-600 hover:bg-orange-50 text-orange-600 transition">
                <Link href="#how-it-works">See How It Works
                </Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl overflow-hidden rounded-xl shadow-xl">
          <div className="gradient p-1 aspect-[16/9]">
            <Image src="/hero.png" width={1280} height={720} alt="banner" className="rounded-lg mx-auto" priority />
          </div>
        </div>
      </section>

 {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">  
        <div className="container mx-auto px-4 md:px-6 text-center">
        <Badge variant="outiline" className="bg-orange-100 text-orange-600">Features</Badge>

        <h2 className="gradient-title mt-2 mx-auto text-3xl md:text-4xl">Everything you need to split expenses</h2>
        <p className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">Handle group expenses effortlessly with our all-in-one toolkit</p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, Icon, bg, color, description }) => (
              <Card key={title} className="flex flex-col items-center space-y-4 p-6 text-center" >
                <div className={`rounded-full p-3 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>

                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

{/* Steps Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
        <Badge variant="outiline" className="bg-orange-100 text-orange-600">How It Works</Badge>

        <h2 className="gradient-title mt-4 mx-auto text-3xl md:text-4xl">Splitting expenses has never been easier</h2>
        <p className="mx-auto mt-2 max-w-[700px] text-gray-500 md:text-xl/relaxed">Follow these simple steps to start splitting expenses with friends</p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
            {STEPS.map(({ title, description, label }) => (
              <div className="flex flex-col items-center space-y-4" key={title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">{label}</div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500 text-center">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Testimonials Section */}
      <section className="bg-gray-50   py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
        <Badge variant="outiline" className="bg-orange-100 text-orange-600">Testimonials</Badge>

        <h2 className="gradient-title mt-4 mx-auto text-3xl md:text-4xl">What others say</h2>


        <div className="mx-auto mt-12 grid max-w-5xl gap-6 mg:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, image }) => (
              <Card key={name}>
                <CardContent>
                  <p className="text-gray-500">{quote}</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={image} alt={name} />
                      <AvatarFallback className="uppercase">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left mt-2">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="gradient py-20">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
            Ready to modernize expense sharing?
          </h2>

          <p className="mx-auto max-w-[600px] text-orange-100 md:text-xl/relaxed">Join now and make splitting expenses math & mess-free</p>

          <Button asChild size={'lg'} className="bg-orange-600 hover:opacity-70">
                <Link href="/dashboard">Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
