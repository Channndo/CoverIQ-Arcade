import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import './EcosystemSection.css';

const REPOS = [
  { name: 'omni-games-hub', role: 'Platform launcher & catalog' },
  { name: 'shared-ui-components', role: 'Cross-game design system' },
  { name: 'shared-assets', role: 'Brand assets & audio' },
  { name: 'shared-auth-system', role: 'Future auth layer' },
];

const INTEGRATIONS = [
  {
    title: 'CoverIQ Arcade',
    description:
      'Embed omni.games titles, feature crossover branding, and launch insurance-themed arcade experiences from a unified hub.',
  },
  {
    title: 'Omnistrata Ecosystem',
    description:
      'Connected identity, achievements, and progression across Omnistrata products — built for long-term expansion.',
  },
];

export function EcosystemSection() {
  return (
    <section id="ecosystem" className="section ecosystem-section">
      <div className="container">
        <SectionHeader
          title="Ecosystem Architecture"
          subtitle="Modular repositories. Independent deploys. One cohesive arcade universe."
          align="center"
        />

        <div className="ecosystem-grid">
          <motion.div
            className="ecosystem-card"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="ecosystem-card__title">Repository Map</h3>
            <ul className="ecosystem-repos">
              {REPOS.map((repo) => (
                <li key={repo.name}>
                  <code>{repo.name}</code>
                  <span>{repo.role}</span>
                </li>
              ))}
              <li className="ecosystem-repos__games">
                <Badge variant="coming-soon">+ 5 game repos</Badge>
                <span>Each title ships independently</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="ecosystem-card"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="ecosystem-card__title">Integrations</h3>
            {INTEGRATIONS.map((item) => (
              <div key={item.title} className="ecosystem-integration">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
