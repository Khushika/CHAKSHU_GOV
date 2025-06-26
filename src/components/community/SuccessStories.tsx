import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Users,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  Shield,
  TrendingUp,
  Award,
  Clock,
  Phone,
  Mail,
} from "lucide-react";

const SuccessStories = () => {
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const successStories = [
    {
      id: 1,
      title: "Community Warning Prevents Mass Investment Scam",
      impact: "₹2.3 Crore Saved",
      victims: "450+ People Protected",
      description:
        "Quick community response to a fake cryptocurrency investment scheme prevented hundreds from losing their life savings.",
      date: "March 2024",
      type: "Investment Fraud",
      outcome: "Scammers arrested, funds recovered",
      location: "Mumbai, Maharashtra",
      timeline: "7 days from alert to resolution",
      fullStory: {
        background:
          "In early March 2024, our community received the first reports about a sophisticated cryptocurrency investment scheme targeting young professionals across Mumbai. The scammers were using fake WhatsApp groups, promising guaranteed returns of 300% within 3 months on Bitcoin investments.",
        initialReports:
          "The first red flag came from Priya Sharma, a software engineer from Andheri, who noticed suspicious activity when the 'investment company' asked for her bank login credentials. She immediately posted in our community forum, describing the exact modus operandi and sharing screenshots of the suspicious messages.",
        communityResponse:
          "Within 2 hours of Priya's post, 15 more community members came forward with similar experiences. Our moderators quickly escalated the issue and created a dedicated alert thread. The community worked together to identify the common patterns: fake company registration numbers, pressure tactics, and requests for sensitive banking information.",
        investigationProcess:
          "Our cyber security volunteers traced the scammer's digital footprint, identifying multiple fake websites and social media profiles. They discovered the scammers were operating from multiple cities and had already collected over ₹50 lakh from victims across different states.",
        lawEnforcementCoordination:
          "The compiled evidence was immediately shared with Mumbai Cyber Police and the Economic Offences Wing. The detailed documentation provided by our community members helped law enforcement understand the scale and methodology of the fraud operation.",
        resolution:
          "Within 7 days, police arrested 8 key members of the fraud ring across Mumbai, Pune, and Delhi. The quick action was possible due to the comprehensive evidence trail created by our vigilant community members.",
        impact: {
          financialSavings: "₹2.3 Crore",
          peopleProtected: "450+",
          arrestsMade: "8",
          citiesInvolved: "3",
          evidenceItems: "127 documents and screenshots",
        },
        testimonials: [
          {
            name: "Priya Sharma",
            role: "Initial Reporter",
            quote:
              "I'm so grateful for this community platform. Without it, I might have lost my entire savings. The quick response saved not just me but hundreds of others.",
          },
          {
            name: "Inspector Rajesh Kumar",
            role: "Mumbai Cyber Police",
            quote:
              "The detailed evidence provided by the community was exceptional. It significantly expedited our investigation and helped us build a strong case.",
          },
        ],
        preventionMeasures: [
          "Enhanced community alert system for investment frauds",
          "Educational workshop series on cryptocurrency safety",
          "Direct liaison established with cyber police",
          "Quick response protocol for financial frauds",
        ],
        mediaCoverage:
          "The case was covered by Times of India, Mumbai Mirror, and featured on a special segment of Crime Patrol, highlighting the power of community vigilance.",
        longTermImpact:
          "This case led to the establishment of dedicated investment fraud monitoring in our community platform, which has since prevented 23 additional investment scams affecting over 1,200 potential victims.",
      },
    },
    {
      id: 2,
      title: "Senior Citizen Safety Campaign Success",
      impact: "85% Reduction",
      victims: "2,000+ Elderly Protected",
      description:
        "Educational campaign targeting senior citizens resulted in significant reduction of tech support scams in Mumbai area.",
      date: "February 2024",
      type: "Tech Support Scam",
      outcome: "Community education program launched",
      location: "Mumbai & Pune",
      timeline: "3 months campaign duration",
      fullStory: {
        background:
          "Senior citizens aged 60+ were increasingly becoming targets of tech support scams, with fraudsters calling and claiming their computers were infected with viruses. These scams were particularly effective because elderly people often felt overwhelmed by technology and trusted the callers' authority.",
        problemScale:
          "Our data showed that 68% of tech support scam victims in Mumbai were senior citizens, with an average loss of ₹25,000 per victim. The psychological impact was often worse than the financial loss, with many seniors becoming afraid to use computers or smartphones altogether.",
        campaignLaunch:
          "We partnered with local senior citizen associations, residential society committees, and community centers to launch 'Digital Suraksha for Seniors' - a comprehensive education and awareness program.",
        educationalComponents:
          "The campaign included interactive workshops, easy-to-understand pamphlets in local languages (Hindi, Marathi, Gujarati), and a dedicated helpline for seniors to verify suspicious tech calls. We also created simple video tutorials featuring local celebrities explaining common scam tactics.",
        communityInvolvement:
          "Younger community members volunteered as 'Tech Buddies' - pairing each senior with a tech-savvy volunteer who could be contacted for verification of any suspicious computer-related calls or messages.",
        realTimeSupport:
          "We established a 24/7 helpline specifically for seniors, staffed by volunteers who could provide immediate guidance when they received suspicious calls. The helpline received over 3,000 calls during the campaign period.",
        measurableResults:
          "Pre-campaign data showed 45 successful tech support scams per month targeting seniors in our coverage area. Post-campaign, this number dropped to just 7 per month - an 85% reduction.",
        impact: {
          scamReduction: "85%",
          seniorsEducated: "2,000+",
          volunteersInvolved: "150",
          workshopsConducted: "48",
          helplineCalls: "3,000+",
        },
        testimonials: [
          {
            name: "Mrs. Sunita Devi",
            role: "Campaign Participant",
            quote:
              "I used to be so scared of these computer calls. Now I know exactly what to do - hang up and call my Tech Buddy first!",
          },
          {
            name: "Dr. Ashok Mehta",
            role: "Senior Citizen Association President",
            quote:
              "This campaign has been a game-changer. Our members now feel confident and empowered when dealing with technology-related issues.",
          },
        ],
        innovativeFeatures: [
          "Multilingual educational materials",
          "Celebrity endorsements in local languages",
          "Tech Buddy mentorship program",
          "24/7 senior-specific helpline",
          "Simple verification protocols",
        ],
        governmentRecognition:
          "The campaign received recognition from the Maharashtra State Government and has been adopted as a model program for other cities across India.",
        expansion:
          "Based on the success in Mumbai, the program has been expanded to 12 additional cities, with plans to cover all major metropolitan areas by 2025.",
      },
    },
    {
      id: 3,
      title: "Rapid Response Stops UPI Fraud Ring",
      impact: "₹45 Lakh Prevented",
      victims: "200+ Users Alerted",
      description:
        "Real-time community alerts helped identify and stop a coordinated UPI fraud attack across multiple cities.",
      date: "January 2024",
      type: "Digital Payment Fraud",
      outcome: "Fraud ring dismantled",
      location: "Delhi, Mumbai, Bangalore",
      timeline: "48 hours from detection to arrest",
      fullStory: {
        background:
          "A sophisticated fraud ring was operating across multiple cities, using fake UPI apps and social engineering to steal money from users' bank accounts. They were particularly targeting users during high-traffic shopping periods and festivals when people were making frequent digital payments.",
        detectionMechanism:
          "The fraud was first detected by our AI-powered community alert system, which noticed an unusual pattern of UPI-related complaints from different cities, all involving similar fake app interfaces and phone numbers.",
        initialAlert:
          "Rohit Verma from Delhi was the first to report a suspicious UPI transaction where he received a fake payment notification and was asked to 'verify' his account details. His detailed report triggered our rapid response protocol.",
        rapidResponse:
          "Within 30 minutes of the initial report, our community moderators had identified 12 similar incidents across Delhi, Mumbai, and Bangalore. A coordinated alert was sent to all community members in these cities, along with screenshots of the fake UPI interface.",
        communityCoordination:
          "Community members shared information in real-time, helping to identify the complete network of fake phone numbers, website URLs, and bank accounts being used by the fraudsters. This crowdsourced intelligence was crucial for law enforcement.",
        lawEnforcementAction:
          "The comprehensive evidence package was simultaneously shared with cyber police in all three cities. The coordinated approach allowed for synchronized raids and prevented the fraudsters from escaping to other locations.",
        technologyRole:
          "Our community platform's real-time alert system and cross-city communication capabilities were key to the rapid identification and response. The platform automatically flagged similar patterns and connected affected users.",
        resolution:
          "Within 48 hours, 6 members of the fraud ring were arrested, 23 fake bank accounts were frozen, and ₹45 lakh in stolen funds was recovered and returned to victims.",
        impact: {
          moneyRecovered: "₹45 Lakh",
          usersProtected: "200+",
          arrestsMade: "6",
          accountsFrozen: "23",
          citiesCovered: "3",
        },
        testimonials: [
          {
            name: "Rohit Verma",
            role: "Initial Reporter",
            quote:
              "I'm amazed at how quickly the community responded. Within hours, hundreds of people were protected from the same scam that almost got me.",
          },
          {
            name: "DCP Cyber Crime",
            role: "Delhi Police",
            quote:
              "The real-time intelligence and coordinated community response made this one of our fastest fraud ring busts. This is the future of cybercrime prevention.",
          },
        ],
        technicalInnovations: [
          "AI-powered pattern recognition for fraud detection",
          "Real-time cross-city alert system",
          "Automated evidence compilation for law enforcement",
          "Crowdsourced intelligence gathering platform",
          "Rapid response notification system",
        ],
        policyImpact:
          "This case led to improved coordination protocols between cyber police departments across different states and influenced national guidelines for digital payment fraud response.",
        continuousImprovement:
          "The success of this rapid response system has led to enhanced AI capabilities that can now predict and prevent fraud patterns before they affect large numbers of users.",
      },
    },
  ];

  const achievements = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "50,000+",
      subtitle: "Active Community Members",
      description: "Citizens working together to fight fraud",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      title: "₹15 Crore",
      subtitle: "Total Amount Saved",
      description: "Money protected from fraudsters",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-yellow-600" />,
      title: "92%",
      subtitle: "Success Rate",
      description: "Of reported scams successfully resolved",
    },
  ];

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Success Stories & Impact
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real outcomes achieved through community collaboration and vigilance.
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {achievements.map((achievement, index) => (
          <Card
            key={index}
            className="text-center hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">{achievement.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {achievement.title}
              </div>
              <div className="text-lg font-semibold text-india-saffron mb-2">
                {achievement.subtitle}
              </div>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Stories */}
      <div className="space-y-8">
        {successStories.map((story) => (
          <Card key={story.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {story.type}
                </Badge>
                <span className="text-sm text-gray-500">{story.date}</span>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {story.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {story.description}
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {story.impact}
                  </div>
                  <div className="text-sm text-gray-600">Financial Impact</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {story.victims}
                  </div>
                  <div className="text-sm text-gray-600">Lives Protected</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">
                    {story.outcome}
                  </div>
                  <div className="text-sm text-gray-600">Final Outcome</div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedStory(story);
                  setIsModalOpen(true);
                }}
              >
                Read Full Story
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center p-8 bg-gradient-to-r from-india-saffron to-saffron-600 rounded-lg text-white">
        <h3 className="text-2xl font-bold mb-4">Be Part of the Solution</h3>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join our community and help protect millions of citizens from fraud.
          Every report matters, every alert saves lives.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="bg-white text-india-saffron hover:bg-gray-100"
            onClick={() => {
              // Scroll to the Discussion Forum section
              const forumSection = document.querySelector(
                'section:has(h2:contains("Community Forum"))',
              );
              if (forumSection) {
                forumSection.scrollIntoView({ behavior: "smooth" });
              } else {
                // Fallback: scroll to any element with "Community Forum" text
                const forumElement = Array.from(
                  document.querySelectorAll("h2"),
                ).find((el) => el.textContent?.includes("Community Forum"));
                forumElement?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Join Community
          </Button>
          <Button
            variant="outline"
            className="bg-white text-india-saffron hover:bg-gray-100"
          >
            Report Fraud Now
          </Button>
        </div>
      </div>

      {/* Full Story Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedStory?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedStory?.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[calc(90vh-140px)] pr-6">
            {selectedStory && (
              <div className="space-y-6">
                {/* Story Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedStory.date}
                      </div>
                      <div className="text-xs text-gray-500">Date</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedStory.location}
                      </div>
                      <div className="text-xs text-gray-500">Location</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedStory.timeline}
                      </div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {selectedStory.type}
                      </div>
                      <div className="text-xs text-gray-500">Fraud Type</div>
                    </div>
                  </div>
                </div>

                {/* Impact Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Impact Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(selectedStory.fullStory.impact).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="text-center p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="text-lg font-bold text-blue-600">
                              {value}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Background */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Background
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.fullStory.background}
                  </p>
                </div>

                <Separator />

                {/* Problem Scale / Initial Reports */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStory.fullStory.problemScale
                      ? "Problem Scale"
                      : "Initial Reports"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.fullStory.problemScale ||
                      selectedStory.fullStory.initialReports}
                  </p>
                </div>

                <Separator />

                {/* Community Response */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Community Response
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.fullStory.communityResponse}
                  </p>
                </div>

                <Separator />

                {/* Investigation/Action Process */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStory.fullStory.investigationProcess
                      ? "Investigation Process"
                      : "Action Taken"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.fullStory.investigationProcess ||
                      selectedStory.fullStory.rapidResponse}
                  </p>
                </div>

                <Separator />

                {/* Resolution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resolution
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.fullStory.resolution}
                  </p>
                </div>

                {/* Testimonials */}
                {selectedStory.fullStory.testimonials && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Community Testimonials
                      </h3>
                      <div className="space-y-4">
                        {selectedStory.fullStory.testimonials.map(
                          (testimonial: any, index: number) => (
                            <Card key={index} className="bg-green-50">
                              <CardContent className="p-4">
                                <p className="italic text-gray-700 mb-3">
                                  "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                                    <span className="text-green-800 font-semibold text-sm">
                                      {testimonial.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {testimonial.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {testimonial.role}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Prevention Measures / Innovations */}
                {(selectedStory.fullStory.preventionMeasures ||
                  selectedStory.fullStory.technicalInnovations) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedStory.fullStory.preventionMeasures
                          ? "Prevention Measures Implemented"
                          : "Technical Innovations"}
                      </h3>
                      <ul className="space-y-2">
                        {(
                          selectedStory.fullStory.preventionMeasures ||
                          selectedStory.fullStory.technicalInnovations
                        ).map((measure: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Long-term Impact */}
                {(selectedStory.fullStory.longTermImpact ||
                  selectedStory.fullStory.expansion) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Long-term Impact
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedStory.fullStory.longTermImpact ||
                          selectedStory.fullStory.expansion}
                      </p>
                    </div>
                  </>
                )}

                {/* Recognition */}
                {(selectedStory.fullStory.mediaCoverage ||
                  selectedStory.fullStory.governmentRecognition) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Recognition & Impact
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedStory.fullStory.mediaCoverage ||
                          selectedStory.fullStory.governmentRecognition}
                      </p>
                    </div>
                  </>
                )}

                {/* Contact Information */}
                <Card className="bg-india-saffron/10 border-india-saffron/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Want to share your success story?
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Help inspire others by sharing how community vigilance
                      helped you or someone you know.
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>stories@fraudwatch.gov.in</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>1930 (Toll-free)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SuccessStories;
