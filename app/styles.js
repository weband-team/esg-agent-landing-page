'use client';

import styled, { keyframes } from 'styled-components';

// ─── ANIMATIONS ───
export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

// ─── NAV COMPONENTS ───
export const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(34, 197, 94, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 2rem;

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
  }
`;

export const NavLogo = styled.a`
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${props => props.theme.colors.green400};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: ${props => props.theme.colors.white};
  }
`;

export const LangToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

export const LangBtn = styled.button`
  padding: 0.3rem 0.85rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: ${props => props.theme.colors.slate400};

  &.active {
    background: ${props => props.theme.colors.green700};
    color: ${props => props.theme.colors.white};
    box-shadow: 0 2px 10px rgba(21, 128, 61, 0.3);
  }
`;

export const NavCta = styled.a`
  background: ${props => props.theme.colors.green600};
  color: ${props => props.theme.colors.white};
  padding: 0.45rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.green500};
    transform: translateY(-1px);
  }
`;

// ─── STRUCTURAL HELPERS ───
export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

export const Section = styled.section`
  padding: 6rem 0;

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const SectionSm = styled.section`
  padding: 4rem 0;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

export const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: ${props => props.theme.colors.green400};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.35rem 0.9rem;
  border-radius: 100px;
  margin-bottom: 1.25rem;

  &::before {
    content: '●';
    font-size: 0.5rem;
    color: ${props => props.theme.colors.green400};
    animation: ${pulse} 2s infinite;
  }
`;

export const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.white};
`;

export const SectionSub = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.slate400};
  max-width: 650px;
  margin-bottom: 3rem;
  line-height: 1.7;
`;

export const GradientText = styled.span`
  background: ${props => props.theme.gradients.textGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent);
  margin: 0;
`;

// ─── HERO COMPONENTS ───
export const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 6rem;
  padding-bottom: 4rem;
`;

export const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 50% -10%, rgba(34, 197, 94, 0.18) 0%, transparent 70%);
`;

export const HeroGrid = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: linear-gradient(${props => props.theme.colors.green500} 1px, transparent 1px),
    linear-gradient(90deg, ${props => props.theme.colors.green500} 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
`;

export const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: ${props => props.theme.colors.gold};
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.4rem 1.1rem;
  border-radius: 100px;
  margin-bottom: 1.75rem;

  .dot {
    width: 6px;
    height: 6px;
    background: ${props => props.theme.colors.gold};
    border-radius: 50%;
    animation: ${pulse} 2s infinite;
  }
`;

export const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6.5vw, 4.5rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.white};
`;

export const HeroSub = styled.p`
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: ${props => props.theme.colors.slate300};
  max-width: 720px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
`;

export const HeroCtaGroup = styled.div`
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3.5rem;
`;

export const ButtonPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: ${props => props.theme.gradients.primaryBtn};
  color: ${props => props.theme.colors.white};
  font-weight: 700;
  font-size: 1rem;
  padding: 0.95rem 2.25rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 30px rgba(34, 197, 94, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 35px rgba(34, 197, 94, 0.45);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${props => props.theme.colors.slate800};
    color: ${props => props.theme.colors.slate500};
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

export const ButtonPrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: ${props => props.theme.gradients.primaryBtn};
  color: ${props => props.theme.colors.white};
  font-weight: 700;
  font-size: 1rem;
  padding: 0.95rem 2.25rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 30px rgba(34, 197, 94, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 35px rgba(34, 197, 94, 0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ButtonSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(30, 41, 59, 0.5);
  color: ${props => props.theme.colors.slate200};
  font-weight: 600;
  font-size: 1rem;
  padding: 0.95rem 2.25rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.slate700};
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    border-color: ${props => props.theme.colors.green700};
    color: ${props => props.theme.colors.green300};
    background: rgba(22, 163, 74, 0.05);
  }
`;

export const ButtonSecondaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(30, 41, 59, 0.5);
  color: ${props => props.theme.colors.slate200};
  font-weight: 600;
  font-size: 1rem;
  padding: 0.95rem 2.25rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.slate700};
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    border-color: ${props => props.theme.colors.green700};
    color: ${props => props.theme.colors.green300};
    background: rgba(22, 163, 74, 0.05);
  }
`;

export const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 4rem;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

export const HeroStat = styled.div`
  text-align: center;

  .num {
    font-size: 2rem;
    font-weight: 800;
    color: ${props => props.theme.colors.green400};
    text-shadow: 0 0 15px rgba(74, 222, 128, 0.2);
  }

  .label {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.slate400};
    margin-top: 0.25rem;
    font-weight: 500;
  }
`;

// ─── TRUST & OPERATOR COMPONENTS ───
export const TrustStrip = styled.section`
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding: 4rem 0;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

export const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const TrustTitleCol = styled.div`
  h3 {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
    color: ${props => props.theme.colors.white};
    letter-spacing: -0.02em;
  }

  p {
    color: ${props => props.theme.colors.slate400};
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

export const TrustBadge = styled.div`
  display: inline-block;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: ${props => props.theme.colors.green400};
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 6px;
  margin-bottom: 1rem;
`;

export const TrustInfoCard = styled.div`
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.75rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const TrustMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }

  .meta-label {
    color: ${props => props.theme.colors.slate400};
    font-weight: 600;
  }

  .meta-val {
    color: ${props => props.theme.colors.white};
    font-weight: 700;
    text-align: right;
  }
`;

// ─── PROBLEM COMPONENTS ───
export const ProblemSection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(180deg, ${props => props.theme.colors.slate950} 0%, ${props => props.theme.colors.slate900} 100%);

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const ProblemCard = styled.div`
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid ${props => props.theme.colors.slate800};
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: rgba(34, 197, 94, 0.25);
    transform: translateY(-2px);
  }

  .problem-icon {
    font-size: 2.25rem;
    margin-bottom: 1.25rem;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: ${props => props.theme.colors.white};
  }

  p {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.65;
  }
`;

// ─── HOW IT WORKS COMPONENTS ───
export const HowSection = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.slate900};

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
`;

export const StepCard = styled.div`
  position: relative;

  .step-num {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${props => props.theme.colors.green700}, ${props => props.theme.colors.emerald500});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    font-weight: 800;
    color: ${props => props.theme.colors.white};
    margin-bottom: 1.25rem;
    box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
  }

  /* For the iteration (+) step */
  .step-num-plus {
    background: transparent;
    border: 2px dashed ${props => props.theme.colors.green500};
    color: ${props => props.theme.colors.green400};
    box-shadow: none;
    font-size: 1.35rem;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.white};
  }

  p {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.65;
  }
`;

// ─── FEATURES COMPONENTS ───
export const FeaturesSection = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.slate950};

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const FeatureCard = styled.div`
  background: ${props => props.theme.gradients.cardGradient};
  border: 1px solid ${props => props.theme.colors.slate800};
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(34, 197, 94, 0.4);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }

  .feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme.colors.white};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.65;
  }

  .feature-badge {
    display: inline-block;
    margin-top: 1rem;
    background: rgba(34, 197, 94, 0.1);
    color: ${props => props.theme.colors.green400};
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    border: 1px solid rgba(34, 197, 94, 0.15);
  }
`;

// ─── REGULATIONS STRIP COMPONENTS ───
export const RegsStrip = styled.div`
  background: ${props => props.theme.colors.slate900};
  padding: 3rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
`;

export const RegsLabel = styled.p`
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${props => props.theme.colors.slate400};
  margin-bottom: 1.5rem;
`;

export const RegsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
`;

export const RegPill = styled.div`
  background: ${props => props.theme.colors.slate800};
  border: 1px solid ${props => props.theme.colors.slate700};
  color: ${props => props.theme.colors.slate300};
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.45rem 1.1rem;
  border-radius: 100px;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(34, 197, 94, 0.3);
  }
`;

// ─── PILOT BANNER COMPONENTS ───
export const PilotBanner = styled.div`
  background: ${props => props.theme.gradients.pilotBannerGradient};
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 24px;
  padding: 3.5rem;
  text-align: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

export const PilotCountdown = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: ${props => props.theme.colors.gold};
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.4rem 1.1rem;
  border-radius: 100px;
  margin-bottom: 1.75rem;
  letter-spacing: 0.02em;
`;

// ─── FOUNDING MEMBER & DEPOSIT CARD COMPONENTS ───
export const FoundingSection = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.slate950};

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const FoundingLayout = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3.5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

export const DepositCard = styled.div`
  background: ${props => props.theme.gradients.goldCardGradient};
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 24px;
  padding: 2.5rem;
  position: sticky;
  top: 6rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

export const DepositPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const DepositAmount = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  color: ${props => props.theme.colors.gold};
  line-height: 1;
  letter-spacing: -0.02em;
`;

export const DepositCurrency = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.goldLight};
`;

export const DepositLabel = styled.p`
  font-size: 0.88rem;
  color: ${props => props.theme.colors.slate400};
  margin-bottom: 2rem;
  font-weight: 500;
`;

export const DepositFeatures = styled.ul`
  list-style: none;
  margin-bottom: 2rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
    color: ${props => props.theme.colors.slate300};
    line-height: 1.5;
  }

  li:last-child {
    border-bottom: none;
  }

  .check {
    color: ${props => props.theme.colors.green400};
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: -0.05rem;
    font-weight: bold;
  }
`;

export const DepositRefundBanner = styled.div`
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.18);
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.green300};
  line-height: 1.5;
  margin-bottom: 2rem;
  display: flex;
  gap: 0.5rem;
`;

export const BenefitList = styled.ul`
  list-style: none;
`;

export const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

export const BenefitIconWrap = styled.div`
  width: 46px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
`;

export const BenefitText = styled.div`
  h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.colors.white};
    margin-bottom: 0.35rem;
    letter-spacing: -0.01em;
  }

  p {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.6;
  }
`;

export const BenefitValueBadge = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  color: ${props => props.theme.colors.goldLight};
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.15);
`;

// ─── FORM & SECTION COMPONENTS ───
export const FormSection = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.slate900};

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const FormWrap = styled.div`
  max-width: 680px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid ${props => props.theme.colors.slate700};
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 1.75rem;
  }

  h3 {
    font-size: 1.75rem;
    font-weight: 800;
    color: ${props => props.theme.colors.white};
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .form-sub {
    font-size: 0.95rem;
    color: ${props => props.theme.colors.slate400};
    margin-bottom: 2.25rem;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${props => props.theme.colors.slate300};
    margin-bottom: 0.5rem;
    letter-spacing: 0.02em;
  }

  input, select, textarea {
    width: 100%;
    background: ${props => props.theme.colors.slate950};
    border: 1px solid ${props => props.theme.colors.slate700};
    border-radius: 10px;
    color: ${props => props.theme.colors.white};
    font-size: 0.95rem;
    font-family: var(--font-inter), 'Inter', sans-serif;
    padding: 0.8rem 1.1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;

    &:focus {
      border-color: ${props => props.theme.colors.green500};
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
    }
  }

  select option {
    background: ${props => props.theme.colors.slate900};
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const FormCheck = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.84rem;
  color: ${props => props.theme.colors.slate400};
  line-height: 1.6;
  margin-bottom: 1.25rem;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    margin-top: 0.2rem;
    flex-shrink: 0;
    accent-color: ${props => props.theme.colors.green500};
    width: 15px;
    height: 15px;
  }

  a {
    color: ${props => props.theme.colors.green400};
    text-decoration: underline;
    font-weight: 600;
  }
`;

export const FormNote = styled.p`
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.78rem;
  color: ${props => props.theme.colors.slate500};
  line-height: 1.55;
`;

// ─── DEPOSIT FLOW COMPONENTS ───
export const DepositFlowSection = styled.section`
  padding: 4rem 0;
  background: ${props => props.theme.colors.slate900};

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

export const FlowStepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  position: relative;
`;

export const FlowStepCard = styled.div`
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid ${props => props.theme.colors.slate800};
  border-radius: 16px;
  padding: 2rem;
  position: relative;

  .flow-num {
    width: 34px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.theme.colors.gold};
    color: ${props => props.theme.colors.slate950};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 900;
    margin-bottom: 1.25rem;
    box-shadow: 0 3px 10px rgba(245, 158, 11, 0.35);
  }

  /* For checkmark step */
  .flow-num-check {
    background: ${props => props.theme.colors.green500};
    color: ${props => props.theme.colors.white};
    box-shadow: 0 3px 10px rgba(34, 197, 94, 0.35);
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.colors.white};
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }

  p {
    font-size: 0.88rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.6;
  }

  .flow-note {
    margin-top: 0.75rem;
    font-size: 0.78rem;
    color: ${props => props.theme.colors.green400};
    font-weight: 700;
  }
`;

// ─── FAQ COMPONENTS ───
export const FaqSection = styled.section`
  padding: 6rem 0;
  background: ${props => props.theme.colors.slate950};

  @media (max-width: 768px) {
    padding: 4.5rem 0;
  }
`;

export const FaqList = styled.div`
  max-width: 750px;
  margin: 0 auto;
`;

export const FaqItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.slate800};
  padding: 1.5rem 0;
  cursor: pointer;

  &.open .faq-icon {
    transform: rotate(45deg);
    color: ${props => props.theme.colors.gold};
  }

  &.open .faq-a {
    max-height: 250px;
    padding-top: 1rem;
  }
`;

export const FaqQuestion = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${props => props.theme.colors.white};
  gap: 1.5rem;
  transition: color 0.2s;

  ${FaqItem}:hover & {
    color: ${props => props.theme.colors.green300};
  }
`;

export const FaqIcon = styled.span`
  color: ${props => props.theme.colors.green500};
  font-size: 1.35rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  font-weight: 300;
`;

export const FaqAnswer = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.92rem;
  color: ${props => props.theme.colors.slate400};
  line-height: 1.7;
`;

// ─── FINAL CTA COMPONENTS ───
export const FinalCtaSection = styled.section`
  background: ${props => props.theme.gradients.finalCtaGradient};
  border-top: 1px solid rgba(34, 197, 94, 0.15);
  text-align: center;
  padding: 7rem 0;

  h2 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.white};
  }

  p {
    font-size: 1.1rem;
    color: ${props => props.theme.colors.slate300};
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
  }
`;

// ─── FOOTER COMPONENTS ───
export const Footer = styled.footer`
  background: ${props => props.theme.colors.slate950};
  border-top: 1px solid ${props => props.theme.colors.slate900};
  padding: 3.5rem 0;
  text-align: center;

  p {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.slate500};
    line-height: 1.6;
  }

  a {
    color: ${props => props.theme.colors.slate400};
    margin: 0 0.75rem;
    transition: color 0.15s;

    &:hover {
      color: ${props => props.theme.colors.green400};
    }
  }
`;

// ─── MODAL COMPONENTS ───
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
    pointer-events: all;
  }
`;

export const ModalCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.slate900} 0%, #0a1124 100%);
  border: 1px solid ${props => props.theme.colors.slate700};
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  padding: 2.5rem;
  position: relative;
  transform: translateY(20px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 197, 94, 0.05);
  max-height: 90vh;
  overflow-y: auto;

  ${ModalOverlay}.active & {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 1.75rem 1.25rem;
  }
`;

export const ModalClose = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: ${props => props.theme.colors.slate400};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${props => props.theme.colors.white};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  gap: 1.25rem;
  align-items: start;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.4rem;
    font-weight: 800;
    color: ${props => props.theme.colors.white};
    letter-spacing: -0.02em;
    margin-bottom: 0.35rem;
  }

  p {
    font-size: 0.88rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.5;
  }
`;

export const ModalIcon = styled.div`
  font-size: 2.25rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.1);
`;

export const ModalTrustBanner = styled.div`
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  font-size: 0.82rem;
  color: ${props => props.theme.colors.green300};
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ModalFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const ModalFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 0.75rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .field-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: ${props => props.theme.colors.slate500};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

export const FieldValueWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const FieldValue = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.slate200};
  word-break: break-all;

  &.highlight-value {
    color: ${props => props.theme.colors.white};
    font-family: monospace;
    font-size: 1.05rem;
    letter-spacing: 0.02em;
  }
`;

export const CopyBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: ${props => props.theme.colors.slate400};
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.green700};
    border-color: ${props => props.theme.colors.green600};
    color: ${props => props.theme.colors.white};
    box-shadow: 0 2px 10px rgba(21, 128, 61, 0.3);
  }

  &.copied {
    background: ${props => props.theme.colors.emerald500};
    border-color: ${props => props.theme.colors.emerald400};
    color: ${props => props.theme.colors.white};
  }
`;

export const ModalFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.25rem;

  p {
    font-size: 0.82rem;
    color: ${props => props.theme.colors.slate400};
    line-height: 1.5;
  }
`;

// ─── LEGAL PAGE LAYOUT COMPONENTS ───
export const LegalContainer = styled.div`
  max-width: 850px;
  margin: 0 auto;
  padding: 8rem 1.5rem 6rem;
`;

export const LegalHeader = styled.div`
  text-align: center;
  margin-bottom: 3.5rem;

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.white};
  }

  p {
    font-size: 1.05rem;
    color: ${props => props.theme.colors.slate400};
  }
`;

export const LegalCard = styled.div`
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid ${props => props.theme.colors.slate800};
  border-radius: 24px;
  padding: 3.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  h2 {
    font-size: 1.35rem;
    font-weight: 800;
    color: ${props => props.theme.colors.white};
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 0.5rem;
    letter-spacing: -0.01em;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.colors.green400};
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 0.92rem;
    color: ${props => props.theme.colors.slate300};
    line-height: 1.7;
    margin-bottom: 1.25rem;
  }

  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  li {
    font-size: 0.92rem;
    color: ${props => props.theme.colors.slate300};
    line-height: 1.7;
    margin-bottom: 0.5rem;
  }
`;

export const LegalMetaTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);

  td {
    padding: 0.75rem 1rem;
    font-size: 0.88rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);

    @media (max-width: 600px) {
      padding: 0.5rem 0.75rem;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }

  td.label {
    color: ${props => props.theme.colors.slate400};
    font-weight: 600;
    width: 30%;
  }

  td.value {
    color: ${props => props.theme.colors.white};
    font-weight: 600;
  }
`;
