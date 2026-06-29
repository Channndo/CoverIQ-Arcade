import { motion } from 'framer-motion';
import './SectionHeader.css';

interface SectionHeaderProps {
  id?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({ id, title, subtitle, align = 'left' }: SectionHeaderProps) {
  return (
    <motion.header
      id={id}
      className={`section-header section-header--${align}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </motion.header>
  );
}
