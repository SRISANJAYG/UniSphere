import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import Post from '../models/post.model.js';
import Assignment from '../models/assignment.model.js';
import Event from '../models/event.model.js';
import Club from '../models/club.model.js';

// Only called by the explicitly isolated demo launcher.
export async function addShowcaseContent() {
 const alex=await User.findOne({username:'alexr'}),priya=await User.findOne({username:'priyasharma'}),faculty=await User.findOne({username:'profvance'});
 const day=86400000, date=days=>new Date(Date.now()+days*day);
 const design=await Course.create({code:'UX210',title:'Designing Interfaces People Love',description:'From a rough sketch to a thoughtful product. Learn visual hierarchy, accessible forms, interaction design, and usability testing. Showcase sample course.',department:'Design & Creative Media',instructor:faculty.name,credits:3,schedule:'Tue, Thu 11:00 AM – 12:00 PM',room:'Design Studio 2',syllabus:['Visual hierarchy and typography','Accessible interaction patterns','Prototyping and usability testing'],resources:[{title:'W3C accessibility fundamentals',url:'https://www.w3.org/WAI/fundamentals/',type:'Document'}],enrolledStudents:[alex._id],createdBy:faculty._id});
 await Course.create({code:'DS220',title:'Data Structures: Think Like a Problem Solver',description:'Build confidence with arrays, trees, graphs, and practical algorithm challenges. Showcase sample course.',instructor:faculty.name,credits:4,schedule:'Mon, Wed, Fri 09:00 AM – 10:00 AM',room:'Computing Lab 4',syllabus:['Arrays and linked lists','Trees and search','Graphs and shortest paths'],resources:[{title:'Visual algorithm explorations',url:'https://visualgo.net/en',type:'Resource'}],createdBy:faculty._id});
 await Assignment.create({course:design._id,title:'Build a friendly onboarding flow',description:'Create a three-screen student onboarding flow. Explain your typography choices and provide an accessible form design. Submit a brief answer and a prototype link. Showcase assignment.',dueDate:date(3),maxPoints:100,createdBy:faculty._id});
 await Event.create({title:'Campus After Hours: Music & Makers',description:'An evening of acoustic music, student demos, and good conversations. Bring your latest project or just bring a friend. Showcase sample event.',category:'Cultural',date:date(6),time:'05:30 PM – 08:00 PM',venue:'Open Air Amphitheatre',organizer:'Student Community Council',banner:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&auto=format&fit=crop&q=85',capacity:250,createdBy:faculty._id});
 await Club.create({name:'The Design Collective',tagline:'Good ideas deserve thoughtful design.',description:'A welcoming place for visual storytellers, UI builders, photographers, and curious beginners. Weekly design jams and friendly portfolio reviews. Showcase sample club.',category:'Arts',lead:'Priya Sharma',logo:'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=240&auto=format&fit=crop&q=85',members:[priya._id],createdBy:priya._id,announcements:[{title:'Friday Design Jam',content:'One hour. One campus problem. Endless possibilities. Meet us in Studio 2 at 4 PM.'}]});
 await Post.insertMany([
 {author:priya._id,content:'[Showcase] A tiny win worth sharing: our team turned a messy whiteboard into a working campus app this weekend. The best part? Everyone brought a different skill. What are you building this week? ✨',category:'Project',mediaUrl:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1100&auto=format&fit=crop&q=85',likes:[faculty._id]},
 {author:faculty._id,content:'[Showcase] Your next great project starts with a question, not a framework. This week: interview two classmates, find one real campus problem, and sketch a useful solution. I cannot wait to see your ideas.',category:'Academic',likes:[priya._id]},
 {author:alex._id,content:'[Showcase] Campus photo walk, golden-hour edition 📸 No fancy camera needed. Looking for a few friends who enjoy finding beauty between lectures. Meet at the library steps this Friday?',category:'Campus',mediaUrl:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1100&auto=format&fit=crop&q=85',likes:[priya._id]},
 {author:priya._id,content:'[Showcase] Quick poll: coffee first, code first, or stare at the bug until it fixes itself? ☕ My vote: find a study buddy and make the debugging a little more fun.',category:'General',likes:[faculty._id]}
 ]);
 console.log('Showcase additions ready: courses, assignment, cultural event, design club, and social posts.');
}
