import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  Orbit,
  Sparkles,
  Check,
  Command,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UniSphereLogo, UniSphereIcon } from "../components/UniSphereLogo";
import "./Landing.css";
const features = [
  {
    number: "01",
    icon: Users,
    title: "Find your people.",
    text: "Meet the collaborators, communities, and friends who make campus feel like yours.",
    route: "/students",
    tag: "COMMUNITY",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Make room to grow.",
    text: "Bring your courses, resources, and assignments together. A little less chaos. A lot more clarity.",
    route: "/courses",
    tag: "ACADEMICS",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Be part of something.",
    text: "From your first club meeting to your next big hackathon. Discover what is happening around you.",
    route: "/events",
    tag: "CAMPUS LIFE",
  },
];
export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [spinning,setSpinning] = useState(false);
  const destination = isAuthenticated ? "/dashboard" : "/register";
  return (
    <div className="sphere-landing observatory-landing">
      <section className="sphere-hero">
        <div className="sphere-grid" aria-hidden="true" />
        <div className="sphere-glow" aria-hidden="true" />
        <div className="sphere-hero-content">
          <div className="sphere-eyebrow">
            <span /> YOUR CAMPUS. MORE CONNECTED.
          </div>
          <h1>
            A whole world.
            <br />
            Your <span>UniSphere.</span>
          </h1>
          <p>
            The people, the possibilities, the moments that matter.
            <br className="desktop-break" /> Bring your university life into one
            shared space.
          </p>
          <div className="sphere-actions">
            <Link to={destination} className="sphere-cta">
              {isAuthenticated ? "Open your dashboard" : "Find your sphere"}
              <ArrowUpRight size={19} />
            </Link>
            <a href="#possibilities" className="sphere-text-link">
              Explore the possibilities <ArrowRight size={16} />
            </a>
          </div>
          <div className="sphere-note">
            <span>
              <Check size={13} /> Built for students
            </span>
            <span>
              <Check size={13} /> Free to connect
            </span>
          </div>
        </div>
        <div className="sphere-art"
          onPointerMove={event=>{
            if(event.pointerType==='touch')return;
            const rect=event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--tilt-x',((.5-(event.clientY-rect.top)/rect.height)*7)+'deg');
            event.currentTarget.style.setProperty('--tilt-y',(((event.clientX-rect.left)/rect.width-.5)*9)+'deg');
          }}
          onPointerLeave={event=>{event.currentTarget.style.setProperty('--tilt-x','0deg');event.currentTarget.style.setProperty('--tilt-y','0deg');}}
        >
          <div className="sphere-sparkles">
            {Array.from({length:7},(_,index)=><span key={index} style={{left:((index*37+9)%97)+'%',top:((index*23+7)%91)+'%',width:index%4===0?3:2,height:index%4===0?3:2,animationDelay:-(index*.7)+'s',animationDuration:(4+index%5)+'s'}}/>)}
          </div>
          <div className="orbit-arrival">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
          </div>

          <button type="button" aria-label="Spin the UniSphere globe" title="Tap to spin" className={'sphere-core'+(spinning?' is-spinning':'')}
            onClick={()=>{if(!spinning && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)setSpinning(true);}}
            onAnimationEnd={event=>{if(event.animationName==='sphere-turn-clock')setSpinning(false);}}
          >
            <div className="sphere-latitude" />
            <div className="sphere-longitude" />
            <span className="sphere-surface-mark"><UniSphereIcon size={98} /></span>
          </button>



          <div className="sphere-float float-top">
            <span className="float-icon">
              <Users size={19} />
            </span>
            <div>
              Find your community<small>Your people are here.</small>
            </div>
            <ArrowUpRight size={16} />
          </div>
          <div className="sphere-float float-bottom">
            <span className="float-icon">
              <Sparkles size={19} />
            </span>
            <div>
              Your next chapter<small>Starts with a connection.</small>
            </div>
          </div>
          <span className="art-coordinate">
            CONNECTED BY POSSIBILITY · 360°
          </span>
        </div>
        <div className="sphere-hero-bottom">
          <span>ONE SPACE. ENDLESS POSSIBILITIES.</span>
          <a href="#possibilities">
            Scroll to discover <span>↓</span>
          </a>
        </div>
      </section>
      <div className="sphere-ribbon">
        <span>
          <Command size={17} /> LESS SWITCHING. MORE LIVING.
        </span>
        <span>
          Learn together <span className="ribbon-star">✳</span> Create together{" "}
          <span className="ribbon-star">✳</span> Grow together{" "}
          <span className="ribbon-star">✳</span> Belong together
        </span>
      </div>
      <section className="sphere-features" id="possibilities">
        <div className="sphere-section-heading">
          <div>
            <div className="sphere-eyebrow">A LITTLE CLOSER TO EVERYTHING</div>
            <h2>
              Campus life.
              <br />
              <span>All in your orbit.</span>
            </h2>
          </div>
          <p>
            Big ideas need a place to begin. Find the tools and connections to
            make the most of your university years.
          </p>
        </div>
        <div className="sphere-feature-grid">
          {features.map(({ icon: Icon, ...feature }) => (
            <Link
              key={feature.number}
              to={isAuthenticated ? feature.route : "/register"}
              className="sphere-feature"
            >
              <div className="feature-top">
                <span>{feature.tag}</span>
                <span>{feature.number} /</span>
              </div>
              <Icon size={32} strokeWidth={1.3} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-bottom">
                Explore <ArrowUpRight size={21} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="sphere-connect">
        <div className="sphere-eyebrow">
          <Orbit size={15} /> BUILT AROUND YOU
        </div>
        <h2>
          Your university years.
          <br />
          Make them <em>count.</em>
        </h2>
        <p>
          Share an idea. Find a study partner. Show up for something new.
          <br />
          It all starts here.
        </p>
        <Link to={destination} className="sphere-cta">
          Step into UniSphere <ArrowUpRight size={19} />
        </Link>
      </section>
      <footer className="sphere-footer">
        <Link to="/">
          <UniSphereLogo size={30} />
        </Link>
        <span>Connect. Learn. Grow. Together.</span>
        <span>© {new Date().getFullYear()} UniSphere</span>
      </footer>
    </div>
  );
}
