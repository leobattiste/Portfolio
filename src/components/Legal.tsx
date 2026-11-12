import { site, href } from "@/lib/site";
import { Intro, Section } from "./Layout";

export function Privacy() {
  return (
    <>
      <Intro><h1 className="statement">Privacy</h1></Intro>
      <Section label="Overview">
        <div className="prose">
          <p>This is the personal portfolio of {site.name}. You can browse Work, Journal, and the Playground without creating an account. This policy explains what the website collects and how that information is used.</p>
          <p>The public website does not run ads or use third-party advertising or analytics trackers.</p>
        </div>
      </Section>
      <Section label="Visits">
        <div className="prose">
          <p>To understand how the site is used, it records the page visited, time of the visit, referring website when available, and a random visitor identifier associated with your browser tab.</p>
          <p>The identifier is kept in session storage. The site's own analytics do not use cookies or deliberately collect your IP address. If your browser sends a Do Not Track signal, the site skips this page-view recording.</p>
          <p>The hosting provider may process technical information, including IP addresses, to deliver the site and protect its services.</p>
        </div>
      </Section>
      <Section label="Messages">
        <div className="prose">
          <p>When you send a message through the contact form, the name, email address, and message you provide are stored so I can read and respond to you. Please avoid sending sensitive information through this form.</p>
        </div>
      </Section>
      <Section label="Appearance">
        <div className="prose">
          <p>Your light or dark theme preference is saved in your browser's local storage. It is not sent to the site's database. You can clear it at any time by clearing the site's local storage.</p>
          <p>The temporary identifier used for page-view counting is kept separately in session storage.</p>
        </div>
      </Section>
      <Section label="Services and external links">
        <div className="prose">
          <p>Supabase stores website content, contact messages, and page-view records. Hosting services process the information required to deliver the site. They may keep technical logs under their own policies.</p>
          <p>Some pages link to other websites and services. When you follow those links, their own privacy policies apply.</p>
        </div>
      </Section>
      <Section label="Retention and security">
        <div className="prose">
          <p>Contact messages and visit information are kept as needed to operate the website, review activity, and manage correspondence. Access to stored information is restricted, but no online service can guarantee complete security.</p>
          <p>If you want to ask about a message you sent or request its deletion, email <a href={`mailto:${site.email}`}>{site.email}</a>. Requests will be reviewed in line with applicable law.</p>
        </div>
      </Section>
      <Section label="Changes">
        <div className="prose">
          <p>This policy may change when the website or its services change. The latest version will appear on this page.</p>
          <p>Last updated: November 11, 2026.</p>
        </div>
      </Section>
    </>
  );
}

export function Terms() {
  return (
    <>
      <Intro><h1 className="statement">Terms</h1></Intro>
      <Section label="Using the website">
        <div className="prose">
          <p>These terms cover your use of {site.name}'s personal portfolio, including Work, Journal, the Playground, and the contact form. Please use the website lawfully and respect the rights of others.</p>
        </div>
      </Section>
      <Section label="Content and ownership">
        <div className="prose">
          <p>Unless otherwise stated, original writing, design, and other material created for this portfolio belong to {site.name}. You may share links to these pages with credit. Please ask before copying or republishing original material for commercial use, except where the law permits it.</p>
          <p>Third-party photographs, project screenshots, trademarks, album artwork, and product names remain the property of their respective owners. Featuring them here does not imply a partnership or endorsement.</p>
        </div>
      </Section>
      <Section label="External services">
        <div className="prose">
          <p>Pages here may link to external websites, which are operated by their own providers. Their terms, policies, and charges apply when you use them.</p>
        </div>
      </Section>
      <Section label="Contact form">
        <div className="prose">
          <p>You may contact me with genuine questions or project inquiries. Do not use the form to send spam, harmful or unlawful material, or information you do not have permission to share.</p>
          <p>Contact details are used to review and respond to messages, as explained in the <a href={href("/privacy/")}>Privacy Policy</a>.</p>
        </div>
      </Section>
      <Section label="Accuracy and availability">
        <div className="prose">
          <p>I try to keep the website accurate and available, but I may update or remove content and features. Links can stop working, and information may become outdated. Please check important details with the original source.</p>
          <p>The site is provided for general information. To the extent permitted by law, it is provided without warranties, and I am not responsible for losses arising from reliance on its content or services operated by others.</p>
        </div>
      </Section>
      <Section label="Updates and contact">
        <div className="prose">
          <p>These terms may be updated as the website changes. The current version will be available here. Questions can be sent to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
          <p>Last updated: November 11, 2026.</p>
        </div>
      </Section>
    </>
  );
}
