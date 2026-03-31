import './HowItWorks.css';

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your account with just an email and password. Claim your unique username — your link will be linx.app/you.' },
  { num: '02', title: 'Add Your Links', desc: 'Add any link — social profiles, websites, YouTube channels, online stores. Reorder them with a simple drag and drop.' },
  { num: '03', title: 'Share Everywhere', desc: 'Share your Linx URL in your Instagram bio, email signature, or wherever you want. Watch clicks roll in on your dashboard.' },
];

export default function HowItWorks() {
  return (
    <div className="hiw-bg">
      <section className="section">
        <div className="hiw-tag">How it works</div>
        <h2 className="section-title hiw-title">Live in 3 simple steps.</h2>
        <p className="section-sub hiw-sub">No design skills needed. Set up your Linx page in minutes.</p>
        <div className="steps">
          {steps.map(s => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
