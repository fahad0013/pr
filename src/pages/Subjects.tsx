import { SubjectCard } from "@/components/SubjectCard";

const subjects = [
  { name: "বাংলা ভাষা ও সাহিত্য", icon: "📚", topicCount: 45, completionPercent: 68 },
  { name: "English Language", icon: "🔤", topicCount: 38, completionPercent: 42 },
  { name: "গণিত", icon: "🔢", topicCount: 52, completionPercent: 35 },
  { name: "সাধারণ জ্ঞান (বাংলাদেশ)", icon: "🇧🇩", topicCount: 60, completionPercent: 55 },
  { name: "সাধারণ জ্ঞান (আন্তর্জাতিক)", icon: "🌍", topicCount: 40, completionPercent: 28 },
  { name: "সাধারণ বিজ্ঞান", icon: "🔬", topicCount: 35, completionPercent: 20 },
  { name: "কম্পিউটার ও তথ্যপ্রযুক্তি", icon: "💻", topicCount: 25, completionPercent: 60 },
  { name: "মানসিক দক্ষতা", icon: "🧠", topicCount: 30, completionPercent: 15 },
  { name: "ভূগোল ও পরিবেশ", icon: "🗺️", topicCount: 22, completionPercent: 10 },
  { name: "নৈতিকতা ও সুশাসন", icon: "⚖️", topicCount: 18, completionPercent: 5 },
];

export default function Subjects() {
  return (
    <div className="container max-w-2xl py-6 animate-fade-in">
      <h1 className="mb-1 text-2xl font-bold">বিষয়সমূহ</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        BCS প্রিলিমিনারি পরীক্ষার সকল বিষয়
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {subjects.map((sub) => (
          <SubjectCard key={sub.name} {...sub} />
        ))}
      </div>
    </div>
  );
}
