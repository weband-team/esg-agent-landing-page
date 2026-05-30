'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../../lib/theme';
import translations from './translations';
import {
  Nav,
  NavLogo,
  NavMenu,
  NavMenuLink,
  LangToggle,
  LangBtn,
  NavCta,
  NavSecondaryCta,
  Container,
  Tag,
  SectionTitle,
  SectionSub,
  GradientText,
  Divider,
  ButtonPrimary,
  ButtonSecondary,
  Footer
} from '../styles';

// ─── ANIMATIONS ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleUp = keyframes`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const pulseGlow = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

// ─── LOCAL STYLED COMPONENTS ───
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-top: 6rem;
  padding-bottom: 2rem;
  background-color: ${theme.colors.slate950};
  background-image: ${theme.gradients.bgGradient};
  background-attachment: fixed;
  color: ${theme.colors.slate200};
`;

const BgDecoration = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 15%, rgba(34, 197, 94, 0.12) 0%, transparent 60%);
  z-index: 0;
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: linear-gradient(${theme.colors.green500} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.colors.green500} 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
`;

// ─── GLASSMORPHIC LOADER SCREEN ───
const LoaderOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoaderOrb = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
  animation: ${pulseGlow} 4s infinite ease-in-out;
`;

const LoaderCard = styled.div`
  position: relative;
  z-index: 1;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: ${scaleUp} 0.5s ease-out;
`;

const LoaderLogo = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
`;

const LoaderTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${theme.colors.white};
  margin-bottom: 0.75rem;
`;

const LoaderSubtitle = styled.p`
  color: ${theme.colors.slate400};
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ProgressBarWrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 99px;
  height: 8px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const ProgressBar = styled.div`
  background: ${theme.gradients.primaryBtn};
  height: 100%;
  border-radius: 99px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease-out;
  box-shadow: 0 0 12px ${theme.colors.green500}aa;
`;

const ProgressText = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${theme.colors.green400};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

// ─── WIZARD PROGRESS STEP BAR ───
const WizardProgress = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto 3rem auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 2rem;
    right: 2rem;
    height: 2px;
    background: rgba(255, 255, 255, 0.05);
    z-index: -1;
    transform: translateY(-50%);
  }
`;

const ProgressLineActive = styled.div`
  position: absolute;
  top: 50%;
  left: 2rem;
  width: ${props => props.$width}%;
  height: 2px;
  background: ${theme.colors.green500};
  z-index: -1;
  transform: translateY(-50%);
  transition: width 0.4s ease;
  box-shadow: 0 0 8px ${theme.colors.green500}88;
`;

const StepIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  opacity: ${props => props.$isVisited ? 1 : 0.4};
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const StepDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$isActive ? theme.colors.slate950 : (props.$isCompleted ? theme.colors.green700 : 'rgba(30, 41, 59, 0.8)')};
  border: 2px solid ${props => props.$isActive ? theme.colors.green400 : (props.$isCompleted ? theme.colors.green500 : 'rgba(255, 255, 255, 0.1)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${props => props.$isActive || props.$isCompleted ? theme.colors.white : theme.colors.slate400};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isActive ? `0 0 15px ${theme.colors.green500}66` : 'none'};
`;

const StepLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$isActive ? theme.colors.green400 : theme.colors.slate400};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  max-width: 100px;
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

// ─── PROFILE FORM & GENERAL WIZARD CONTAINER ───
const WizardCard = styled.div`
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const WizardHeader = styled.div`
  margin-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1.5rem;
`;

const WizardTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${theme.colors.white};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span {
    color: ${theme.colors.green400};
  }
`;

const WizardDesc = styled.p`
  color: ${theme.colors.slate400};
  font-size: 0.95rem;
  margin-top: 0.5rem;
  line-height: 1.5;
`;

// ─── FORM ELEMENTS ───
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  grid-column: ${props => props.$fullWidth ? 'span 2' : 'auto'};
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${theme.colors.slate300};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  span {
    color: ${theme.colors.green500};
  }
`;

const Input = styled.input`
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: ${theme.colors.white};
  font-size: 0.95rem;
  transition: all 0.25s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    background: rgba(30, 41, 59, 0.6);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
  }

  &::placeholder {
    color: ${theme.colors.slate500};
  }
`;

const Select = styled.select`
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: ${theme.colors.white};
  font-size: 0.95rem;
  transition: all 0.25s ease;
  cursor: pointer;

  option {
    background: ${theme.colors.slate900};
    color: ${theme.colors.white};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    background: rgba(30, 41, 59, 0.6);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
  }
`;

const Textarea = styled.textarea`
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: ${theme.colors.white};
  font-size: 0.95rem;
  transition: all 0.25s ease;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    background: rgba(30, 41, 59, 0.6);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
  }

  &::placeholder {
    color: ${theme.colors.slate500};
  }
`;

// ─── QUESTIONS SCROLLABLE FLOW LAYOUT ───
const QuestionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const QuestionItemCard = styled.div`
  background: rgba(30, 41, 59, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  padding: 1.75rem 2rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &:hover {
    border-color: rgba(34, 197, 94, 0.15);
    background: rgba(30, 41, 59, 0.3);
  }

  ${props => props.$isAnswered && css`
    border-left: 4px solid ${theme.colors.green500};
  `}
`;

const QuestionText = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.5;
  color: ${theme.colors.white};
`;

const OptionsGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    ${props => props.$hasNA && css`
      grid-template-columns: repeat(4, 1fr);
    `}
  }
`;

const OptionButton = styled.button`
  background: ${props => props.$selected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(15, 23, 42, 0.3)'};
  border: 1px solid ${props => props.$selected ? theme.colors.green500 : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  color: ${props => props.$selected ? theme.colors.white : theme.colors.slate300};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: ${props => props.$selected ? theme.colors.green400 : 'rgba(34, 197, 94, 0.3)'};
    background: ${props => props.$selected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.04)'};
    transform: translateY(-1px);
  }
`;

const NavigationGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2rem;
  margin-top: 2rem;
`;

// ─── EXTENDED MODE GLASSMORPHIC MODAL ───
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalWindow = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 28px;
  max-width: 600px;
  width: 100%;
  padding: 3rem;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.15), 0 25px 50px -12px rgba(0,0,0,0.6);
  animation: ${scaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  animation: ${pulseGlow} 2s infinite;
`;

const ModalTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${theme.colors.white};
  margin-bottom: 1rem;
`;

const ModalDesc = styled.p`
  color: ${theme.colors.slate300};
  font-size: 0.98rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
`;

const ModalActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: center;
  }
`;

// ─── RESULTS DASHBOARD STYLES ───
const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.4));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    align-items: center;
    justify-content: space-around;
  }
`;

const OverallGaugeWrap = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
`;

const OverallScoreText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  span.val {
    font-size: 2.8rem;
    font-weight: 900;
    color: ${theme.colors.white};
    line-height: 1;
  }

  span.label {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${theme.colors.slate400};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
  }
`;

const HeroTextInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 500px;
`;

const TierBadge = styled.div`
  align-self: center;
  @media (min-width: 768px) {
    align-self: flex-start;
  }
  background: ${props => props.$color}15;
  border: 1px solid ${props => props.$color};
  color: ${props => props.$color};
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-block;
  box-shadow: 0 0 10px ${props => props.$color}22;
`;

const SubscoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CategoryGaugeCard = styled.div`
  background: rgba(30, 41, 59, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.08);
  }
`;

const CategoryGaugeLabel = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${theme.colors.slate300};
`;

const RecommendationBlock = styled.div`
  background: rgba(30, 41, 59, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 2.5rem;
`;

const RecItem = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 16px;
  border-left: 4px solid ${theme.colors.green500};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BenchmarksBlock = styled.div`
  background: rgba(30, 41, 59, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 2.5rem;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
`;

const Th = styled.th`
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem 1.25rem;
  color: ${theme.colors.white};
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Td = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: ${theme.colors.slate300};
`;

// ─── DOCUMENT UPLOADER STYLES ───
const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragActive ? theme.colors.green500 : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.isDragActive ? 'rgba(34, 197, 94, 0.04)' : 'rgba(15, 23, 42, 0.2)'};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &:hover {
    border-color: ${theme.colors.green500};
    background: rgba(34, 197, 94, 0.02);
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: ${theme.colors.slate400};
`;

const UploadText = styled.h5`
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.white};
`;

const UploadHint = styled.p`
  font-size: 0.82rem;
  color: ${theme.colors.slate500};
`;

const AnalysisResultWrap = styled.div`
  background: rgba(30, 41, 59, 0.25);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const IsoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const IsoCard = styled.div`
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const IsoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: ${theme.colors.white};
`;

const IsoBadge = styled.span`
  background: ${theme.colors.green700}30;
  border: 1px solid ${theme.colors.green500};
  color: ${theme.colors.green400};
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
`;

const IsoProgressWrap = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
`;

const IsoProgressBar = styled.div`
  height: 100%;
  background: ${theme.colors.green500};
  width: ${props => props.$width}%;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2.5rem;
  
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: center;
  }
`;

// ─── QUESTIONS DEFINITIONS ───
const QUESTION_DEFINITIONS = {
  business_env: [
    { id: 'c1', category: 'C', key: 'survey.c.c1' },
    { id: 'c2', category: 'C', key: 'survey.c.c2' },
    { id: 'c3', category: 'C', key: 'survey.c.c3' },
    { id: 'r1', category: 'R', key: 'survey.r.r1' },
    { id: 'r2', category: 'R', key: 'survey.r.r2' },
    { id: 'r3', category: 'R', key: 'survey.r.r3' }
  ],
  environment: [
    { id: 'e1', category: 'E', key: 'survey.e.e1' },
    { id: 'e2', category: 'E', key: 'survey.e.e2' },
    { id: 'e3', category: 'E', key: 'survey.e.e3' },
    { id: 'e4', category: 'E', key: 'survey.e.e4' },
    { id: 'e4a', category: 'E', key: 'survey.e.e4a' },
    { id: 'e5', category: 'E', key: 'survey.e.e5' },
    { id: 'e5a', category: 'E', key: 'survey.e.e5a' },
    { id: 'e6', category: 'E', key: 'survey.e.e6' },
    { id: 'e7', category: 'E', key: 'survey.e.e7' },
    { id: 'e8', category: 'E', key: 'survey.e.e8' },
    { id: 'e9', category: 'E', key: 'survey.e.e9' }
  ],
  social: [
    { id: 's1', category: 'S', key: 'survey.s.s1' },
    { id: 's2', category: 'S', key: 'survey.s.s2' },
    { id: 's3', category: 'S', key: 'survey.s.s3' },
    { id: 's4', category: 'S', key: 'survey.s.s4' },
    { id: 's5', category: 'S', key: 'survey.s.s5' },
    { id: 's6', category: 'S', key: 'survey.s.s6' },
    { id: 's7', category: 'S', key: 'survey.s.s7' },
    { id: 's8', category: 'S', key: 'survey.s.s8' },
    { id: 's9', category: 'S', key: 'survey.s.s9' }
  ],
  governance: [
    { id: 'g1', category: 'G', key: 'survey.g.g1' },
    { id: 'g2', category: 'G', key: 'survey.g.g2' },
    { id: 'g3', category: 'G', key: 'survey.g.g3' },
    { id: 'g4', category: 'G', key: 'survey.g.g4' },
    { id: 'g5', category: 'G', key: 'survey.g.g5' },
    { id: 'g6', category: 'G', key: 'survey.g.g6' },
    { id: 'g7', category: 'G', key: 'survey.g.g7' },
    { id: 'g8', category: 'G', key: 'survey.g.g8' },
    { id: 'g9', category: 'G', key: 'survey.g.g9' }
  ],
  supply_chain: [
    { id: 'sc1', category: 'SC', key: 'survey.sc.sc1' },
    { id: 'sc2', category: 'SC', key: 'survey.sc.sc2' },
    { id: 'sc3', category: 'SC', key: 'survey.sc.sc3' },
    { id: 'sc4', category: 'SC', key: 'survey.sc.sc4' },
    { id: 'sc5', category: 'SC', key: 'survey.sc.sc5' },
    { id: 'sc6', category: 'SC', key: 'survey.sc.sc6' },
    { id: 'sc7', category: 'SC', key: 'survey.sc.sc7' },
    { id: 'sc8', category: 'SC', key: 'survey.sc.sc8' },
    { id: 'sc9', category: 'SC', key: 'survey.sc.sc9' }
  ],
  extended: [
    { id: 'x1', category: 'X', key: 'survey.x.x1' },
    { id: 'x2', category: 'X', key: 'survey.x.x2' },
    { id: 'x3', category: 'X', key: 'survey.x.x3' },
    { id: 'x4', category: 'X', key: 'survey.x.x4' },
    { id: 'x5', category: 'X', key: 'survey.x.x5' },
    { id: 'x6', category: 'X', key: 'survey.x.x6' },
    { id: 'x7', category: 'X', key: 'survey.x.x7' },
    { id: 'x8', category: 'X', key: 'survey.x.x8' },
    { id: 'x9', category: 'X', key: 'survey.x.x9' },
    { id: 'x10', category: 'X', key: 'survey.x.x10' },
    { id: 'x11', category: 'X', key: 'survey.x.x11' },
    { id: 'x12', category: 'X', key: 'survey.x.x12' }
  ]
};

export default function BenchmarkPage() {
  // ─── COMPONENT STATE ───
  const [lang, setLang] = useState('pl');
  const [loadedCount, setLoadedCount] = useState(0);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const progressPercent = Math.round((loadedCount / 5) * 100);


  // Profile data state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    country: 'Polska',
    level: '',
    goal: '',
    comment: '',
    industry: '',
    employees: '',
    revenue: '',
    balanceSheet: ''
  });

  // Organization mode / Extended state
  const [orgProfile, setOrgProfile] = useState('MSP'); // 'MSP' or 'LARGE'
  const [extendedMode, setExtendedMode] = useState(false);
  const [showExtendedModal, setShowExtendedModal] = useState(false);

  // Questionnaire Flow
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // Document analysis
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const fileInputRef = useRef(null);

  // Email submission and pipeline states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ─── SEQUENTIAL SCRIPT LOADER ───
  useEffect(() => {
    const scripts = [
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      "/benchmark/scoring.bundle.js",
      "/benchmark/pdf-template.js",
      "/benchmark/mock-data.js"
    ];

    let currentIdx = 0;

    const loadNextScript = () => {
      if (currentIdx >= scripts.length) {
        setScriptsLoaded(true);
        return;
      }

      const src = scripts[currentIdx];
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        currentIdx++;
        setLoadedCount(currentIdx);
        loadNextScript();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        currentIdx++;
        setLoadedCount(currentIdx);
        loadNextScript();
      };
      script.onerror = () => {
        currentIdx++;
        setLoadedCount(currentIdx);
        loadNextScript();
      };
      document.body.appendChild(script);
    };

    loadNextScript();
  }, []);

  // ─── LANGUAGE STORAGE ───
  useEffect(() => {
    const savedLang = localStorage.getItem('esg_lang');
    if (savedLang === 'en' || savedLang === 'pl') {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('esg_lang', lang);
    if (lang === 'en') {
      document.body.classList.add('en');
    } else {
      document.body.classList.remove('en');
    }
  }, [lang]);

  // Translate helper callback
  const t = (key, defaultValue) => {
    return translations[lang]?.[key] || translations['en']?.[key] || defaultValue;
  };

  // ─── SIZING ENGINE & GREY-ZONE LOGIC ───
  const showBalanceSheet = 
    (userData.employees === '1_10' || userData.employees === '11_50' || userData.employees === '51_250') &&
    (userData.revenue === '50_250' || userData.revenue === '250_500');

  const classifyOrganization = (employees, revenue, balanceSheet) => {
    if (
      employees === '251_500' || 
      employees === '500_plus' || 
      revenue === '250_plus'
    ) {
      return 'LARGE';
    }

    const isEmployeesSME = employees === '1_10' || employees === '11_50' || employees === '51_250';
    const isRevenueGrey = revenue === '50_250' || revenue === '250_500';

    if (isEmployeesSME && isRevenueGrey) {
      if (balanceSheet === 'between180_230' || balanceSheet === 'above230') {
        return 'LARGE';
      }
    }

    return 'MSP';
  };

  // ─── WIZARD STEPS DEFINITIONS ───
  const getWizardSteps = () => {
    const steps = [
      { id: 'profile', title: lang === 'pl' ? 'Profil' : 'Profile' },
      { id: 'business_env', title: lang === 'pl' ? 'Otoczenie' : 'Business Env' },
      { id: 'environment', title: lang === 'pl' ? 'E (Środowisko)' : 'Environment' },
      { id: 'social', title: lang === 'pl' ? 'S (Społeczeństwo)' : 'Social' },
      { id: 'governance', title: lang === 'pl' ? 'G (Ład)' : 'Governance' },
      { id: 'supply_chain', title: lang === 'pl' ? 'Łańcuch dostaw' : 'Supply Chain' }
    ];

    if (extendedMode) {
      steps.push({ id: 'extended', title: lang === 'pl' ? 'Medyczna Gotowość' : 'System Readiness' });
    }

    steps.push({ id: 'results', title: lang === 'pl' ? 'Wyniki' : 'Results' });
    return steps;
  };

  const steps = getWizardSteps();
  const currentStep = steps[activeStepIndex];

  // ─── FORM & ANSWER FIELD VALIDATIONS ───
  const isStepCompleted = (stepId) => {
    if (stepId === 'profile') {
      const emailValid = userData.email && userData.email.includes('@');
      const baseValid = userData.name && emailValid && userData.company && userData.country && userData.level && userData.goal && userData.industry && userData.employees && userData.revenue;
      if (showBalanceSheet) {
        return !!(baseValid && userData.balanceSheet);
      }
      return !!baseValid;
    }
    
    const qList = QUESTION_DEFINITIONS[stepId];
    if (!qList) return true; // results
    
    return qList.every(q => answers[q.id] !== undefined);
  };

  // ─── PROFILE HANDLERS ───
  const handleProfileChange = (e, field) => {
    setUserData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // ─── ANSWER CHOICE HANDLER ───
  const selectOption = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // ─── STEP NAVIGATION HANDLERS ───
  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep.id === 'profile') {
      // Run organization classification
      const classified = classifyOrganization(userData.employees, userData.revenue, userData.balanceSheet);
      setOrgProfile(classified);

      if (classified === 'LARGE') {
        // If large, open Extended Mode selection pop-up
        setShowExtendedModal(true);
      } else {
        // Otherwise SME (MSP), proceed to Business Environment
        setExtendedMode(false);
        setActiveStepIndex(1);
      }
    } else {
      if (activeStepIndex < steps.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      }
    }
  };

  // Modal actions
  const activateExtended = () => {
    setExtendedMode(true);
    setShowExtendedModal(false);
    setActiveStepIndex(1);
  };

  const skipExtended = () => {
    setExtendedMode(false);
    setShowExtendedModal(false);
    setActiveStepIndex(1);
  };

  const computeScoreData = () => {
    if (!scriptsLoaded || !window.ESGScoring) return null;
    const coreScores = window.ESGScoring.computeScores(answers, {
      profile: orgProfile,
      industry: userData.industry
    });
    if (!coreScores) return null;

    // Compute R and C values from answers for Relevance Engine
    const R = window.ESGScoring.computeR ? window.ESGScoring.computeR(answers) : 0;
    const C = window.ESGScoring.computeC ? window.ESGScoring.computeC(answers) : 0;

    // Compute Relevance Engine metrics
    const relevance = window.ESGScoring.computeRelevance ? window.ESGScoring.computeRelevance(answers, coreScores, {
      industry: userData.industry,
      R: R,
      C: C,
      includeExtendedTasks: extendedMode
    }) : null;

    coreScores.relevance = relevance;
    return coreScores;
  };

  const scores = computeScoreData();

  // ─── OPTIONAL DOCUMENT UPLOADER ───
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) {
      triggerAnalysis(file.name);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerAnalysis(file.name);
    }
  };

  const triggerAnalysis = (filename) => {
    setDocName(filename);
    setIsAnalyzingDoc(true);
    setTimeout(() => {
      setIsAnalyzingDoc(false);
      setDocumentUploaded(true);
    }, 1500);
  };

  // ─── PDF COMPILER & EMAIL DISPATCH ───
  const runPdfPipeline = async (shouldDownload = true) => {
    if (!scriptsLoaded || !window.generatePdfHtmlContent || !scores) return null;
    setIsGeneratingPdf(true);

    try {
      // Setup dynamic recommendation object
      let recText = {
        title: "ESG Score: {{ score_overall }}%",
        how: "Establish system tracking for media and emissions.",
        why: "To lower operational risks and align with regulatory compliance."
      };

      if (scores.percent >= 81) {
        recText = {
          title: lang === 'pl' ? "Poziom Zaawansowany: Lider ESG ({{ score_overall }}%)" : "Advanced Level: ESG Leader ({{ score_overall }}%)",
          how: lang === 'pl' ? "Kontynuuj automatyzację zbierania danych ESG, rozszerz analizę na pełen Scope 3 emisji oraz regularnie certyfikuj dostawców." : "Continue automating ESG data collection, expand emissions tracking to full Scope 3, and regularly audit your supply chain.",
          why: lang === 'pl' ? "Utrzymanie pozycji lidera zwiększy Twoją konkurencyjność w przetargach u dużych korporacji i obniży koszty finansowania." : "Maintaining leader status will increase your competitiveness in enterprise tenders and lower capital acquisition costs."
        };
      } else if (scores.percent >= 51) {
        recText = {
          title: lang === 'pl' ? "Poziom Umiarkowany: Solidny compliance ({{ score_overall }}%)" : "Moderate Level: Solid Compliance ({{ score_overall }}%)",
          how: lang === 'pl' ? "Zintegruj zbieranie danych o zużyciu mediów w systemie cyfrowym, sformalizuj kodeks etyki dla pracowników i dostawców." : "Digitize utility and media tracking, and formalize a code of ethics for both employees and third-party vendors.",
          why: lang === 'pl' ? "Pozwoli to na szybką reakcję na rosnące wymogi raportowe klientów oraz ułatwi uzyskanie finansowania dłużnego." : "This will enable rapid response to growing client reporting demands and streamline securing debt financing."
        };
      } else if (scores.percent >= 31) {
        recText = {
          title: lang === 'pl' ? "Poziom Podwyższonego Ryzyka ({{ score_overall }}%)" : "Elevated Risk Level ({{ score_overall }}%)",
          how: lang === 'pl' ? "Uruchom podstawowy monitoring zużycia energii i paliw, wdróż podstawowe procedury BHP oraz określ osoby odpowiedzialne za kwestie ESG." : "Launch basic energy and fuel consumption monitoring, formalize basic occupational health procedures, and assign ESG responsibilities.",
          why: lang === 'pl' ? "Zminimalizuje to ryzyko odrzucenia w procesach zakupowych i zapobiegnie nagłym karom administracyjnym." : "This minimizes the risk of disqualification in procurement audits and avoids unexpected compliance penalties."
        };
      } else {
        recText = {
          title: lang === 'pl' ? "Poziom Krytyczny: Brak podstaw ({{ score_overall }}%)" : "Critical Level: Missing Foundations ({{ score_overall }}%)",
          how: lang === 'pl' ? "Przeprowadź inwentaryzację struktury organizacyjnej, wdróż elementarne zasady BHP, zacznij gromadzić rachunki za media i paliwa." : "Conduct a basic review of your organizational structure, implement essential workplace safety rules, and start collecting utility invoices.",
          why: lang === 'pl' ? "Zbuduje to fundament compliance niezbędny do przetrwania w nowoczesnym łańcuchu dostaw." : "This establishes the basic compliance foundation required to remain viable as a vendor in modern supply chains."
        };
      }

      // Generate HTML string from window template compiler
      const hasEsgDoc = documentUploaded;
      const docAnalysis = documentUploaded ? window.MOCK_DATA.esgDocumentAnalysis : null;

      const htmlContent = await window.generatePdfHtmlContent(
        scores,
        lang,
        t,
        recText,
        {
          name: userData.name,
          company: userData.company,
          generatedAt: new Date().toISOString()
        },
        [],
        hasEsgDoc,
        docAnalysis
      );

      // Render offscreen and divide at page breaks
      const offscreenDiv = document.createElement('div');
      offscreenDiv.style.position = 'absolute';
      offscreenDiv.style.left = '-9999px';
      offscreenDiv.style.top = '0';
      offscreenDiv.style.width = '794px'; // Core A4 width at 96 DPI
      offscreenDiv.style.background = '#ffffff';
      offscreenDiv.style.color = '#333333';
      offscreenDiv.innerHTML = htmlContent;
      document.body.appendChild(offscreenDiv);

      const children = Array.from(offscreenDiv.childNodes);
      const pages = [];
      let currentElements = [];

      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node.style?.pageBreakBefore === 'always' || node.outerHTML?.includes('page-break-before: always'))) {
          if (currentElements.length > 0) {
            pages.push(currentElements);
          }
          currentElements = [];
        } else {
          currentElements.push(node);
        }
      }
      if (currentElements.length > 0) {
        pages.push(currentElements);
      }

      // Compile pages sequentially into jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pages.length; i++) {
        const pageElements = pages[i];
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '794px';
        tempContainer.style.background = '#ffffff';
        tempContainer.style.color = '#333333';
        tempContainer.style.padding = '40px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.fontFamily = 'Arial, sans-serif';

        for (const el of pageElements) {
          tempContainer.appendChild(el.cloneNode(true));
        }

        document.body.appendChild(tempContainer);

        const canvas = await window.html2canvas(tempContainer, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      // Cleanup
      document.body.removeChild(offscreenDiv);

      if (shouldDownload) {
        pdf.save(`ESG_Benchmark_Report_${userData.company.replace(/\s+/g, '_')}.pdf`);
      }

      setIsGeneratingPdf(false);
      return pdf;

    } catch (err) {
      console.error('PDF compiling pipeline failed:', err);
      setIsGeneratingPdf(false);
      alert(lang === 'pl' ? 'Błąd generowania PDF. Spróbuj ponownie.' : 'PDF generation error. Please try again.');
      return null;
    }
  };

  // Email form submit handler
  const handleEmailSubmission = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Compile PDF first
      const pdf = await runPdfPipeline(false);
      if (!pdf) {
        throw new Error('Failed compiling PDF report.');
      }

      // Convert to base64
      const pdfBlob = pdf.output('blob');
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];

        // Send POST payload
        const response = await fetch('/api/benchmark/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            company: userData.company,
            score: scores.percent,
            answers: answers,
            pdfBase64: base64,
            lang: lang,
            filename: `ESG_Benchmark_Report_${userData.company.replace(/\s+/g, '_')}.pdf`
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Server error occurred');
        }

        setEmailSuccess(true);
      };
    } catch (error) {
      console.error('Email pipeline submit error:', error);
      alert(lang === 'pl' ? `Błąd: ${error.message}` : `Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roundScore = (val) => {
    if (val === undefined || val === null) return 0;
    return Math.round(val * 10) / 10;
  };

  // Score tiers helper
  const getOverallTier = (percent) => {
    if (percent >= 81) {
      return { label: lang === 'pl' ? 'Dobry (Good)' : 'Good', color: '#22c55e', emoji: '🟢' };
    }
    if (percent >= 51) {
      return { label: lang === 'pl' ? 'Umiarkowany (Moderate)' : 'Moderate', color: '#eab308', emoji: '🟡' };
    }
    if (percent >= 31) {
      return { label: lang === 'pl' ? 'Podwyższone ryzyko (Elevated Risk)' : 'Elevated Risk', color: '#f97316', emoji: '🟠' };
    }
    return { label: lang === 'pl' ? 'Krytyczny (Critical)' : 'Critical', color: '#ef4444', emoji: '🔴' };
  };

  const getSubscoreColor = (val) => {
    if (val >= 81) return '#22c55e';
    if (val >= 51) return '#eab308';
    if (val >= 31) return '#f97316';
    return '#ef4444';
  };

  const overallTier = scores ? getOverallTier(scores.percent) : null;

  return (
    <>
      {/* HEADER NAV (NO PRINT) */}
      <Nav className="no-print">
        <NavLogo href="/">
          🌿 <span>ESG</span> Compliance Agent
        </NavLogo>
        <NavMenu>
          <NavMenuLink href="/benchmark">Benchmark</NavMenuLink>
          <NavMenuLink href="/regulations-search">
            {lang === 'pl' ? 'Wyszukiwarka Regulacji' : 'Regulations Search'}
          </NavMenuLink>
        </NavMenu>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LangToggle>
            <LangBtn className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</LangBtn>
            <LangBtn className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangBtn>
          </LangToggle>
          <NavSecondaryCta href="https://app.esgsyncpro.qirelab.com" target="_blank">
            {lang === 'pl' ? 'Uruchom wersję testową (Pilot) ↗' : 'Launch Pilot App ↗'}
          </NavSecondaryCta>
          <NavCta href="/#join">
            {lang === 'pl' ? 'Odbierz darmowy dostęp →' : 'Get free access →'}
          </NavCta>
        </div>
      </Nav>

      {/* SEQUENTIAL SCRIPT LOADER GLASSMORPHIC SCREEN */}
      {!scriptsLoaded && (
        <LoaderOverlay>
          <LoaderOrb />
          <LoaderCard>
            <LoaderLogo>🌿</LoaderLogo>
            <LoaderTitle>
              {lang === 'pl' ? 'Ładowanie modułu ESG Benchmark' : 'Loading ESG Benchmark'}
            </LoaderTitle>
            <LoaderSubtitle>
              {lang === 'pl' 
                ? 'Gromadzimy zasoby analityczne, silnik punktacji scoringowej i szablony raportu ESG...' 
                : 'Assembling compliance components, custom scoring engines, and reporting templates...'}
            </LoaderSubtitle>
            <ProgressBarWrapper>
              <ProgressBar $progress={progressPercent} />
            </ProgressBarWrapper>
            <ProgressText>{progressPercent}%</ProgressText>
          </LoaderCard>
        </LoaderOverlay>
      )}

      {/* MAIN LAYOUT */}
      {scriptsLoaded && (
        <PageWrapper>
          <BgDecoration />
          <GridOverlay />
          <Container>
            
            {/* WIZARD TRACK STEP BAR (Hidden on Results index) */}
            {activeStepIndex < steps.length - 1 && (
              <WizardProgress>
                <ProgressLineActive $width={(activeStepIndex / (steps.length - 2)) * 100} />
                {steps.slice(0, -1).map((s, idx) => (
                  <StepIndicator 
                    key={s.id} 
                    $isActive={idx === activeStepIndex}
                    $isCompleted={idx < activeStepIndex}
                    $isVisited={idx <= activeStepIndex}
                    onClick={() => isStepCompleted(s.id) && setActiveStepIndex(idx)}
                  >
                    <StepDot $isActive={idx === activeStepIndex} $isCompleted={idx < activeStepIndex}>
                      {idx + 1}
                    </StepDot>
                    <StepLabel $isActive={idx === activeStepIndex}>{s.title}</StepLabel>
                  </StepIndicator>
                ))}
              </WizardProgress>
            )}

            {/* CONDITIONAL GLASSMORPHIC POPUP MODAL (For LARGE Organizations) */}
            {showExtendedModal && (
              <ModalOverlay>
                <ModalWindow>
                  <ModalIcon>🏢</ModalIcon>
                  <ModalTitle>
                    {lang === 'pl' ? 'Weryfikacja podmiotu' : 'Organization Classification'}
                  </ModalTitle>
                  <ModalDesc>
                    {lang === 'pl' 
                      ? 'Twoja organizacja została zaklasyfikowana jako DUŻE PRZEDSIĘBIORSTWO na podstawie zatrudnienia lub przychodów. Zalecamy aktywację Trybu Rozszerzonego (Dodatkowe 12 pytań w sekcji 7) w celu weryfikacji gotowości systemowej na wymogi ESRS.'
                      : 'Your organization has been classified as a LARGE ENTERPRISE based on employee headcount or revenue. We recommend activating Extended Mode (Additional 12 questions in Step 7) to fully evaluate systemic readiness under ESRS standards.'}
                  </ModalDesc>
                  <ModalActionGroup>
                    <ButtonPrimary onClick={activateExtended}>
                      {lang === 'pl' ? 'Aktywuj tryb rozszerzony' : 'Activate Extended Mode'}
                    </ButtonPrimary>
                    <ButtonSecondary onClick={skipExtended} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      {lang === 'pl' ? 'Pozostań przy podstawowym' : 'Keep Basic Mode'}
                    </ButtonSecondary>
                  </ModalActionGroup>
                </ModalWindow>
              </ModalOverlay>
            )}

            {/* WIZARD CONTAINER CARDS */}
            <WizardCard>
              
              {/* STEP 1: PROFILE SETUP */}
              {currentStep.id === 'profile' && (
                <div>
                  <WizardHeader>
                    <WizardTitle>
                      📝 <span>{lang === 'pl' ? 'Dane identyfikacyjne' : 'Profile Details'}</span>
                    </WizardTitle>
                    <WizardDesc>
                      {lang === 'pl' 
                        ? 'Wypełnij profil podmiotu. Służy to dopasowaniu wag branżowych w algorytmie i kalkulacji wielkości organizacji.' 
                        : 'Complete your profile details. Sizing algorithms adjust weights dynamically based on your headcount and sector.'}
                    </WizardDesc>
                  </WizardHeader>
                  <FormGrid>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Imię i nazwisko' : 'Name'} <span>*</span></Label>
                      <Input 
                        placeholder="Jan Kowalski" 
                        value={userData.name}
                        onChange={(e) => handleProfileChange(e, 'name')}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Adres e-mail' : 'Email'} <span>*</span></Label>
                      <Input 
                        type="email"
                        placeholder="jan.kowalski@firma.pl" 
                        value={userData.email}
                        onChange={(e) => handleProfileChange(e, 'email')}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Nazwa firmy' : 'Company'} <span>*</span></Label>
                      <Input 
                        placeholder="Acme Sp. z o.o." 
                        value={userData.company}
                        onChange={(e) => handleProfileChange(e, 'company')}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Kraj' : 'Country'} <span>*</span></Label>
                      <Input 
                        placeholder="Polska" 
                        value={userData.country}
                        onChange={(e) => handleProfileChange(e, 'country')}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Poziom stanowiska' : 'Job Title'} <span>*</span></Label>
                      <Select value={userData.level} onChange={(e) => handleProfileChange(e, 'level')}>
                        <option value="">-- Wybierz / Select --</option>
                        <option value="Board">{lang === 'pl' ? 'Zarząd / CEO' : 'Executive Board'}</option>
                        <option value="Director">{lang === 'pl' ? 'Dyrektor / Manager' : 'Director / Manager'}</option>
                        <option value="Specialist">{lang === 'pl' ? 'Specjalista' : 'Specialist'}</option>
                        <option value="Consultant">{lang === 'pl' ? 'Doradca zewnętrzny' : 'Consultant'}</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Cel oceny' : 'Assessment Goal'} <span>*</span></Label>
                      <Select value={userData.goal} onChange={(e) => handleProfileChange(e, 'goal')}>
                        <option value="">-- Wybierz / Select --</option>
                        <option value="Compliance">{lang === 'pl' ? 'Compliance regulacyjny (wymogi prawne)' : 'Regulatory compliance'}</option>
                        <option value="Client">{lang === 'pl' ? 'Odpowiedź na zapytanie klienta' : 'Client supply chain audit'}</option>
                        <option value="Internal">{lang === 'pl' ? 'Strategia wewnętrzna' : 'Internal ESG strategy'}</option>
                        <option value="Education">{lang === 'pl' ? 'Edukacja i samoocena' : 'Education'}</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Branża podmiotu' : 'Industry'} <span>*</span></Label>
                      <Select value={userData.industry} onChange={(e) => handleProfileChange(e, 'industry')}>
                        <option value="">-- Wybierz / Select --</option>
                        <option value="Technology">Technology</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Finance">Finance</option>
                        <option value="Retail">Retail</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Construction">Construction</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Zatrudnienie (Liczba pracowników)' : 'Employees (FTE)'} <span>*</span></Label>
                      <Select value={userData.employees} onChange={(e) => handleProfileChange(e, 'employees')}>
                        <option value="">-- Wybierz / Select --</option>
                        <option value="1_10">1 - 10</option>
                        <option value="11_50">11 - 50</option>
                        <option value="51_250">51 - 250</option>
                        <option value="251_500">251 - 500</option>
                        <option value="500_plus">500+</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>{lang === 'pl' ? 'Roczny obrót netto (Revenue)' : 'Annual Revenue'} <span>*</span></Label>
                      <Select value={userData.revenue} onChange={(e) => handleProfileChange(e, 'revenue')}>
                        <option value="">-- Wybierz / Select --</option>
                        <option value="0_2">&lt; 2 mln EUR</option>
                        <option value="2_10">2 - 10 mln EUR</option>
                        <option value="10_50">10 - 50 mln EUR</option>
                        <option value="50_250">50 - 250 mln EUR</option>
                        <option value="250_plus">250+ mln EUR</option>
                      </Select>
                    </FormGroup>
                    
                    {/* CONDITIONAL FIELD (Sizing Engine Grey-Zone) */}
                    {showBalanceSheet && (
                      <FormGroup>
                        <Label>
                          {lang === 'pl' ? 'Suma bilansowa (Balance Sheet)' : 'Balance Sheet Total'} <span>*</span>
                        </Label>
                        <Select value={userData.balanceSheet} onChange={(e) => handleProfileChange(e, 'balanceSheet')}>
                          <option value="">-- Wybierz / Select --</option>
                          <option value="under180">&lt; 180M PLN (~43M EUR)</option>
                          <option value="between180_230">180M - 230M PLN (43M - 50M EUR)</option>
                          <option value="above230">&gt; 230M PLN (~50M EUR)</option>
                        </Select>
                      </FormGroup>
                    )}
                    
                    <FormGroup $fullWidth>
                      <Label>{lang === 'pl' ? 'Dodatkowy komentarz (max 240 znaków)' : 'Additional Comment'}</Label>
                      <Textarea 
                        maxLength={240}
                        placeholder={lang === 'pl' ? 'Np. Dodatkowe uwagi dotyczące struktury...' : 'E.g. Additional remarks...'}
                        value={userData.comment}
                        onChange={(e) => handleProfileChange(e, 'comment')}
                      />
                    </FormGroup>
                  </FormGrid>
                </div>
              )}

              {/* QUESTIONS GROUPS STEPS */}
              {currentStep.id !== 'profile' && currentStep.id !== 'results' && (
                <div>
                  <WizardHeader>
                    <WizardTitle>
                      🛡️ <span>{currentStep.title}</span>
                    </WizardTitle>
                    <WizardDesc>
                      {lang === 'pl' 
                        ? 'Odpowiedz na wszystkie pytania z tej kategorii. Pytania oznaczone gwiazdką mają kluczowy wpływ na punktację.' 
                        : 'Answer all questions in this category. Core questions have significant weight in compliance algorithms.'}
                    </WizardDesc>
                  </WizardHeader>
                  
                  <QuestionBlock>
                    {QUESTION_DEFINITIONS[currentStep.id]?.map((q) => {
                      const isCR = q.category === 'C' || q.category === 'R';
                      const isNAAllowed = q.category === 'E' || q.category === 'SC' || q.category === 'X';
                      
                      return (
                        <QuestionItemCard key={q.id} $isAnswered={answers[q.id] !== undefined}>
                          <QuestionText>{t(q.key, `Question ${q.id.toUpperCase()}`)}</QuestionText>
                          <OptionsGroup $hasNA={isNAAllowed}>
                            {isCR ? (
                              <>
                                <OptionButton 
                                  $selected={answers[q.id] === 5} 
                                  onClick={() => selectOption(q.id, 5)}
                                >
                                  {lang === 'pl' ? 'Tak (Yes)' : 'Yes'}
                                </OptionButton>
                                <OptionButton 
                                  $selected={answers[q.id] === 3} 
                                  onClick={() => selectOption(q.id, 3)}
                                >
                                  {lang === 'pl' ? 'Czasami' : 'Sometimes'}
                                </OptionButton>
                                <OptionButton 
                                  $selected={answers[q.id] === 0} 
                                  onClick={() => selectOption(q.id, 0)}
                                >
                                  {lang === 'pl' ? 'Nie (No)' : 'No'}
                                </OptionButton>
                              </>
                            ) : (
                              <>
                                <OptionButton 
                                  $selected={answers[q.id] === 5} 
                                  onClick={() => selectOption(q.id, 5)}
                                >
                                  {lang === 'pl' ? 'Tak (Yes)' : 'Yes'}
                                </OptionButton>
                                <OptionButton 
                                  $selected={answers[q.id] === 3} 
                                  onClick={() => selectOption(q.id, 3)}
                                >
                                  {lang === 'pl' ? 'W trakcie' : 'In Progress'}
                                </OptionButton>
                                <OptionButton 
                                  $selected={answers[q.id] === 0} 
                                  onClick={() => selectOption(q.id, 0)}
                                >
                                  {lang === 'pl' ? 'Nie (No)' : 'No'}
                                </OptionButton>
                                {isNAAllowed && (
                                  <OptionButton 
                                    $selected={answers[q.id] === null} 
                                    onClick={() => selectOption(q.id, null)}
                                  >
                                    {lang === 'pl' ? 'Nie dotyczy' : 'N/A'}
                                  </OptionButton>
                                )}
                              </>
                            )}
                          </OptionsGroup>
                        </QuestionItemCard>
                      );
                    })}
                  </QuestionBlock>
                </div>
              )}

              {/* RESULTS SCREEN / DASHBOARD */}
              {currentStep.id === 'results' && scores && (
                <ResultsContainer>
                  
                  {/* HERO HEADER */}
                  <HeroCard>
                    <OverallGaugeWrap>
                      <svg width="200" height="200" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="44" fill="none" stroke={overallTier.color} strokeWidth="8"
                                strokeDasharray="276.46" strokeDashoffset={276.46 - (scores.percent / 100) * 276.46}
                                strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <OverallScoreText>
                        <span className="val">{roundScore(scores.percent)}%</span>
                        <span className="label">{lang === 'pl' ? 'Wynik' : 'Score'}</span>
                      </OverallScoreText>
                    </OverallGaugeWrap>
                    
                    <HeroTextInfo>
                      <TierBadge $color={overallTier.color}>
                        {overallTier.emoji} {overallTier.label}
                      </TierBadge>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.colors.white }}>
                        {lang === 'pl' ? 'Raport gotowości strategicznej' : 'Strategic ESG Readiness'}
                      </h3>
                      <p style={{ color: theme.colors.slate300, fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {lang === 'pl'
                          ? `Firma ${userData.company} osiągnęła poziom dojrzałości ${overallTier.label}. Algorytm obliczył ważoną punktację na podstawie profilu ${orgProfile === 'LARGE' ? 'Dużego Podmiotu' : 'SME/MSP'}.`
                          : `Company ${userData.company} achieved ${overallTier.label} maturity level. Dynamic scoring algorithm weights adjusted for ${orgProfile === 'LARGE' ? 'Large Enterprise' : 'SME/MSP'} profile.`}
                      </p>
                    </HeroTextInfo>
                  </HeroCard>

                  {/* SUB-GAUGES GRID */}
                  <SubscoresGrid>
                    <CategoryGaugeCard>
                      <CategoryGaugeLabel>{lang === 'pl' ? 'Środowisko (E)' : 'Environment'}</CategoryGaugeLabel>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={getSubscoreColor(scores.e_percent)} strokeWidth="6"
                                  strokeDasharray="263.89" strokeDashoffset={263.89 - (scores.e_percent / 100) * 263.89}
                                  strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.2rem', color: theme.colors.white }}>
                          {roundScore(scores.e_percent)}%
                        </div>
                      </div>
                    </CategoryGaugeCard>

                    <CategoryGaugeCard>
                      <CategoryGaugeLabel>{lang === 'pl' ? 'Społeczeństwo (S)' : 'Social'}</CategoryGaugeLabel>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={getSubscoreColor(scores.s_percent)} strokeWidth="6"
                                  strokeDasharray="263.89" strokeDashoffset={263.89 - (scores.s_percent / 100) * 263.89}
                                  strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.2rem', color: theme.colors.white }}>
                          {roundScore(scores.s_percent)}%
                        </div>
                      </div>
                    </CategoryGaugeCard>

                    <CategoryGaugeCard>
                      <CategoryGaugeLabel>{lang === 'pl' ? 'Ład korporacyjny (G)' : 'Governance'}</CategoryGaugeLabel>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={getSubscoreColor(scores.g_percent)} strokeWidth="6"
                                  strokeDasharray="263.89" strokeDashoffset={263.89 - (scores.g_percent / 100) * 263.89}
                                  strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.2rem', color: theme.colors.white }}>
                          {roundScore(scores.g_percent)}%
                        </div>
                      </div>
                    </CategoryGaugeCard>

                    <CategoryGaugeCard>
                      <CategoryGaugeLabel>{lang === 'pl' ? 'Łańcuch dostaw (SC)' : 'Supply Chain'}</CategoryGaugeLabel>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={getSubscoreColor(scores.sc_percent)} strokeWidth="6"
                                  strokeDasharray="263.89" strokeDashoffset={263.89 - (scores.sc_percent / 100) * 263.89}
                                  strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.2rem', color: theme.colors.white }}>
                          {roundScore(scores.sc_percent)}%
                        </div>
                      </div>
                    </CategoryGaugeCard>
                  </SubscoresGrid>

                  {/* RECOGNIZED COMPLIANCE RECOMMENDATIONS */}
                  <RecommendationBlock>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.colors.white }}>
                      💡 {lang === 'pl' ? 'Kluczowe rekomendacje wdrożeniowe' : 'Key Action Recommendations'}
                    </h3>
                    <RecItem>
                      <strong style={{ color: theme.colors.white, fontSize: '1rem' }}>
                        {scores.percent >= 81 ? (lang === 'pl' ? "Utrzymuj i automatyzuj system" : "Maintain and automate systems") :
                         scores.percent >= 51 ? (lang === 'pl' ? "Zintegruj zbieranie danych i stwórz procedury" : "Integrate data & create procedures") :
                         scores.percent >= 31 ? (lang === 'pl' ? "Uruchom elementarne zasady monitoringu" : "Launch elementary reporting rules") :
                         (lang === 'pl' ? "Zbuduj elementarny compliance prawny" : "Build basic legal compliance")}
                      </strong>
                      <p style={{ color: theme.colors.slate300, fontSize: '0.9rem', lineHeight: 1.5, marginTop: '0.25rem' }}>
                        {scores.percent >= 81 
                          ? (lang === 'pl' ? 'Wprowadź zaawansowane audyty trzeciej strony, kontroluj Scope 1-3 przy użyciu dedykowanych integracji API oraz regularnie odświeżaj certyfikacje.' : 'Implement advanced third-party supplier audits, track Scope 1-3 using REST API integrations, and renew certifications regularly.')
                          : scores.percent >= 51
                          ? (lang === 'pl' ? 'Wprowadź formalne polityki etyki oraz zdigitalizuj zbieranie danych o mediach (paliwa, prąd). Rozpocznij monitoring dostawców.' : 'Establish written code of ethics and digitize utility (fuel, power) consumption tracking. Initiate basic vendor risk reviews.')
                          : scores.percent >= 31
                          ? (lang === 'pl' ? 'Ogranicz luki regulacyjne poprzez wdrożenie podstawowych zasad BHP, wyznacz koordynatora ds. ESG i spisuj zużycie mediów.' : 'Mitigate compliance exposures by structuring primary safety parameters, designating an ESG lead, and registering quarterly resource usages.')
                          : (lang === 'pl' ? 'Zbuduj elementarną strukturę: zbierz faktury za paliwo i energię, sformalizuj podstawy BHP i przypisz odpowiedzialność zarządczą.' : 'Form elementary structures: organize utility invoices, establish occupational safety baselines, and assign executive accountability.')}
                      </p>
                    </RecItem>
                  </RecommendationBlock>

                  {/* SECTION 7: COMPETITOR BENCHMARKS */}
                  <BenchmarksBlock>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.colors.white }}>
                      📊 {lang === 'pl' ? 'Sekcja 7: Porównanie benchmarkowe w branży' : 'Section 7: Competitor Benchmark Analytics'}
                    </h3>
                    <p style={{ color: theme.colors.slate400, fontSize: '0.88rem', marginTop: '0.25rem' }}>
                      {lang === 'pl'
                        ? `Porównanie Twoich parametrów z referencyjnymi przedsiębiorstwami w branży ${userData.industry || 'Ogólnej'}:`
                        : `Benchmark of key indicators against typical peer operations within the ${userData.industry || 'General'} sector:`}
                    </p>
                    <TableWrap>
                      <Table>
                        <thead>
                          <tr>
                            <Th>{lang === 'pl' ? 'Nazwa firmy' : 'Company Name'}</Th>
                            <Th>{lang === 'pl' ? 'Branża' : 'Industry'}</Th>
                            <Th>{lang === 'pl' ? 'Maturity Score' : 'Maturity Score'}</Th>
                            <Th>{lang === 'pl' ? 'Luka / Status' : 'Status Gap'}</Th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                            <Td style={{ fontWeight: 700, color: theme.colors.white }}>
                              ⭐ {userData.company} ({lang === 'pl' ? 'Ty' : 'You'})
                            </Td>
                            <Td>{userData.industry}</Td>
                            <Td style={{ fontWeight: 700, color: theme.colors.green400 }}>{roundScore(scores.percent)}%</Td>
                            <Td style={{ fontWeight: 700, color: theme.colors.green400 }}>{lang === 'pl' ? 'Samoocena' : 'Target Baseline'}</Td>
                          </tr>
                          {window.MOCK_DATA?.companyBenchmarks[userData.industry]?.slice(0, 3).map((comp, index) => (
                            <tr key={index}>
                              <Td>{comp.companyName}</Td>
                              <Td>{comp.industry}</Td>
                              <Td>{comp.paygap ? Math.round(75 - index * 8) : 60}%</Td>
                              <Td>
                                {scores.percent >= (75 - index * 8) 
                                  ? (lang === 'pl' ? '🟢 Lider wskaźnika' : '🟢 Performing Above') 
                                  : (lang === 'pl' ? '🔴 Wymaga poprawy' : '🔴 Action Required')}
                              </Td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrap>
                  </BenchmarksBlock>

                  {/* SECTION 8: OPTIONAL DOCUMENT ANALYZER */}
                  <BenchmarksBlock>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.colors.white, marginBottom: '0.5rem' }}>
                      📄 {lang === 'pl' ? 'Sekcja 8: Prześlij dokument ESG (Opcjonalnie)' : 'Section 8: Upload ESG Documentation (Optional)'}
                    </h3>
                    <p style={{ color: theme.colors.slate400, fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      {lang === 'pl'
                        ? 'Załącz sprawozdanie, politykę BHP lub raport zrównoważonego rozwoju. Nasz agent dopasuje Twoje deklaracje z wymogami norm ISO 14001, ISO 26000 i ISO 37001, i dołączy aneks analityczny do Twojego PDF.'
                        : 'Submit a policy file, ESG report, or safety code. The agent parses assertions, matches compliance targets under ISO 14001, ISO 26000, and ISO 37001 guidelines, and appends a compliance annex to your PDF.'}
                    </p>

                    {!documentUploaded && !isAnalyzingDoc && (
                      <UploadArea 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileSelect}
                          accept=".pdf,.docx,.doc,.txt"
                        />
                        <UploadIcon>📤</UploadIcon>
                        <UploadText>{lang === 'pl' ? 'Przeciągnij plik tutaj lub kliknij aby wybrać' : 'Drag file here or click to browse'}</UploadText>
                        <UploadHint>PDF, DOCX, TXT (max. 20MB)</UploadHint>
                      </UploadArea>
                    )}

                    {isAnalyzingDoc && (
                      <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <LoaderOrb style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem auto' }} />
                        <h5 style={{ fontWeight: 700, color: theme.colors.white }}>
                          {lang === 'pl' ? 'Agent analizuje strukturę dokumentu...' : 'Parsing document compliance metrics...'}
                        </h5>
                        <p style={{ color: theme.colors.slate500, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {lang === 'pl' ? 'Mapowanie standardów ESG i sprawdzanie zbieżności ISO...' : 'Comparing assertions against international audit standards...'}
                        </p>
                      </div>
                    )}

                    {documentUploaded && !isAnalyzingDoc && (
                      <AnalysisResultWrap>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                          <div>
                            <strong style={{ color: theme.colors.white, display: 'block' }}>✅ {docName}</strong>
                            <span style={{ fontSize: '0.82rem', color: theme.colors.green400 }}>
                              {lang === 'pl' ? 'Dokument pomyślnie zintegrowany z raportem' : 'Document verified & parsed'}
                            </span>
                          </div>
                          <ButtonSecondary 
                            onClick={() => setDocumentUploaded(false)}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            {lang === 'pl' ? 'Usuń' : 'Remove'}
                          </ButtonSecondary>
                        </div>

                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: theme.colors.slate300, letterSpacing: '0.05em' }}>
                            {lang === 'pl' ? 'Wyniki zgodności norm ISO' : 'ISO Standards Compliance Matching'}
                          </span>
                          <IsoGrid>
                            <IsoCard>
                              <IsoHeader>
                                <span>ISO 14001</span>
                                <IsoBadge>78%</IsoBadge>
                              </IsoHeader>
                              <span style={{ fontSize: '0.8rem', color: theme.colors.slate400 }}>
                                {lang === 'pl' ? 'Zarządzanie Środowiskowe' : 'Environmental Management'}
                              </span>
                              <IsoProgressWrap>
                                <IsoProgressBar $width={78} />
                              </IsoProgressWrap>
                            </IsoCard>
                            <IsoCard>
                              <IsoHeader>
                                <span>ISO 26000</span>
                                <IsoBadge>65%</IsoBadge>
                              </IsoHeader>
                              <span style={{ fontSize: '0.8rem', color: theme.colors.slate400 }}>
                                {lang === 'pl' ? 'Odpowiedzialność Społeczna' : 'Social Responsibility'}
                              </span>
                              <IsoProgressWrap>
                                <IsoProgressBar $width={65} />
                              </IsoProgressWrap>
                            </IsoCard>
                            <IsoCard>
                              <IsoHeader>
                                <span>ISO 37001</span>
                                <IsoBadge>52%</IsoBadge>
                              </IsoHeader>
                              <span style={{ fontSize: '0.8rem', color: theme.colors.slate400 }}>
                                {lang === 'pl' ? 'Przeciwdziałanie Korupcji' : 'Anti-Bribery Standards'}
                              </span>
                              <IsoProgressWrap>
                                <IsoProgressBar $width={52} />
                              </IsoProgressWrap>
                            </IsoCard>
                          </IsoGrid>
                        </div>
                      </AnalysisResultWrap>
                    )}
                  </BenchmarksBlock>

                  {/* REPORT FORM & PDF PIPELINE TRIGGERS */}
                  <RecommendationBlock style={{ border: `1px solid ${theme.colors.green500}33`, background: 'rgba(5, 46, 22, 0.15)' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.colors.white, textAlign: 'center', marginBottom: '1.5rem' }}>
                      📥 {lang === 'pl' ? 'Generowanie raportu końcowego' : 'Receive Final Audit Report'}
                    </h3>
                    
                    {!emailSuccess ? (
                      <form onSubmit={handleEmailSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Label>{lang === 'pl' ? 'Potwierdź odbiorcę' : 'Confirm Recipient Email'}</Label>
                          <Input 
                            type="email" 
                            required 
                            placeholder="firma@firma.pl"
                            value={userData.email}
                            onChange={(e) => handleProfileChange(e, 'email')}
                          />
                        </div>
                        <ButtonPrimary 
                          type="submit" 
                          disabled={isSubmitting || isGeneratingPdf}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          {isSubmitting 
                            ? (lang === 'pl' ? 'Wysyłanie raportu...' : 'Sending Report...') 
                            : (lang === 'pl' ? 'Wyślij kompletny PDF na e-mail' : 'Send complete PDF via Email')}
                        </ButtonPrimary>
                      </form>
                    ) : (
                      <div style={{ padding: '1rem', color: theme.colors.green400, textAlign: 'center', fontWeight: 700 }}>
                        🎉 {lang === 'pl' 
                          ? 'Dziękujemy! Skompilowany raport PDF został wygenerowany, zapisany w rejestrze audytowym i pomyślnie wysłany na Twój adres e-mail.' 
                          : 'Thank you! The compiled PDF report was generated, archived in audit logs, and forwarded to your email inbox successfully.'}
                      </div>
                    )}

                    <Divider style={{ margin: '2rem 0' }} />

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: theme.colors.slate400, display: 'block', marginBottom: '1rem' }}>
                        {lang === 'pl' ? 'Lub ściągnij dokument bezpośrednio na urządzenie:' : 'Or compile and download document immediately to your local device:'}
                      </span>
                      <ButtonSecondary 
                        onClick={() => runPdfPipeline(true)}
                        disabled={isGeneratingPdf || isSubmitting}
                        style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {isGeneratingPdf ? '⏳ Compiling A4 PDF...' : `📥 ${lang === 'pl' ? 'Ściągnij PDF natychmiast' : 'Download PDF Instantly'}`}
                      </ButtonSecondary>
                    </div>
                  </RecommendationBlock>

                </ResultsContainer>
              )}

              {/* NAV GROUP BUTTONS (Hidden on Results index) */}
              {currentStep.id !== 'results' && (
                <NavigationGroup>
                  {activeStepIndex > 0 ? (
                    <ButtonSecondary onClick={handlePrev}>
                      ← {lang === 'pl' ? 'Wstecz' : 'Back'}
                    </ButtonSecondary>
                  ) : (
                    <div />
                  )}
                  
                  <ButtonPrimary 
                    onClick={handleNext}
                    disabled={!isStepCompleted(currentStep.id)}
                  >
                    {activeStepIndex === steps.length - 2 
                      ? (lang === 'pl' ? 'Oblicz wynik →' : 'Calculate Score →') 
                      : (lang === 'pl' ? 'Dalej →' : 'Next →')}
                  </ButtonPrimary>
                </NavigationGroup>
              )}

            </WizardCard>

          </Container>
          <Footer style={{ marginTop: '5rem' }} className="no-print" />
        </PageWrapper>
      )}
    </>
  );
}
