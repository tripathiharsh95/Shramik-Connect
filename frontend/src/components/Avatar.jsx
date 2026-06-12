import React from 'react';
import { Briefcase } from 'lucide-react';

// ─── Stylish SVG Default Avatars: 10 Male + 10 Female + 1 Neutral ───

export const DEFAULT_AVATARS = {

  // ═══════════════════════════════════════════════════════════════
  //  MALE AVATARS (male_1 → male_10)
  // ═══════════════════════════════════════════════════════════════

  // 1. Classic short hair – warm skin
  male_1: (pc = '#e8722a') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FFE3D1" />
      <circle cx="60" cy="52" r="26" fill="#F5C7A1" />
      <path d="M34 46C34 28 44 18 60 18C76 18 86 28 86 46C86 48 82 38 76 34C70 30 60 34 60 34C60 34 50 30 44 34C38 38 34 48 34 46Z" fill="#2C2C2C" />
      <circle cx="50" cy="50" r="2.5" fill="#1a1a1a" />
      <circle cx="70" cy="50" r="2.5" fill="#1a1a1a" />
      <ellipse cx="50" cy="50" rx="3.5" ry="2.5" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
      <ellipse cx="70" cy="50" rx="3.5" ry="2.5" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
      <path d="M54 62C56 65 64 65 66 62" stroke="#c96a4b" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 105C35 90 50 85 60 85C70 85 85 90 95 105C95 112 90 120 60 120C30 120 25 112 25 105Z" fill={pc} />
      <path d="M55 85L58 96L60 85" fill="white" opacity="0.9" />
      <path d="M65 85L62 96L60 85" fill="white" opacity="0.9" />
    </svg>
  ),

  // 2. Glasses + brown hair – fair skin
  male_2: (pc = '#1a6b7a') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E6F2F5" />
      <circle cx="60" cy="52" r="26" fill="#FCE5CD" />
      <path d="M34 42C34 24 46 16 60 16C74 16 86 24 86 42C86 46 80 34 74 30C68 26 60 30 60 30C60 30 52 26 46 30C40 34 34 46 34 42Z" fill="#5F4B32" />
      <rect x="41" y="45" width="14" height="10" rx="3" stroke="#333" strokeWidth="2" fill="none" />
      <rect x="65" y="45" width="14" height="10" rx="3" stroke="#333" strokeWidth="2" fill="none" />
      <line x1="55" y1="50" x2="65" y2="50" stroke="#333" strokeWidth="2" />
      <circle cx="48" cy="50" r="2" fill="#1a1a1a" />
      <circle cx="72" cy="50" r="2" fill="#1a1a1a" />
      <path d="M52 64C55 67 65 67 68 64" stroke="#b5785a" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 105C35 90 50 85 60 85C70 85 85 90 95 105C95 112 90 120 60 120C30 120 25 112 25 105Z" fill={pc} />
    </svg>
  ),

  // 3. Beard + dark hair – medium brown skin
  male_3: (pc = '#d35400') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FFF0E0" />
      <circle cx="60" cy="50" r="26" fill="#D4A574" />
      <path d="M34 44C34 24 46 16 60 16C74 16 86 24 86 44C86 46 82 36 76 32C70 28 60 32 60 32C60 32 50 28 44 32C38 36 34 46 34 44Z" fill="#1C1A27" />
      <circle cx="50" cy="48" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="48" r="2.2" fill="#1a1a1a" />
      <path d="M55 58C57 60 63 60 65 58" stroke="#8B6040" strokeWidth="1.5" strokeLinecap="round" />
      {/* Beard */}
      <path d="M40 56C40 56 42 72 60 74C78 72 80 56 80 56C80 62 76 76 60 78C44 76 40 62 40 56Z" fill="#1C1A27" opacity="0.85" />
      <path d="M25 105C35 90 50 85 60 85C70 85 85 90 95 105C95 112 90 120 60 120C30 120 25 112 25 105Z" fill={pc} />
    </svg>
  ),

  // 4. Curly hair – dark skin
  male_4: (pc = '#2ecc71') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E8F5E9" />
      <circle cx="60" cy="54" r="26" fill="#8D5524" />
      {/* Curly hair */}
      <circle cx="42" cy="34" r="8" fill="#1a1a1a" />
      <circle cx="54" cy="28" r="9" fill="#1a1a1a" />
      <circle cx="66" cy="28" r="9" fill="#1a1a1a" />
      <circle cx="78" cy="34" r="8" fill="#1a1a1a" />
      <circle cx="36" cy="42" r="7" fill="#1a1a1a" />
      <circle cx="84" cy="42" r="7" fill="#1a1a1a" />
      <circle cx="48" cy="24" r="7" fill="#1a1a1a" />
      <circle cx="72" cy="24" r="7" fill="#1a1a1a" />
      <circle cx="60" cy="22" r="8" fill="#1a1a1a" />
      <circle cx="50" cy="52" r="2.5" fill="#0d0d0d" />
      <circle cx="70" cy="52" r="2.5" fill="#0d0d0d" />
      <path d="M53 66C56 69 64 69 67 66" stroke="#6B3A1F" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 108C35 92 50 86 60 86C70 86 85 92 95 108C95 114 90 120 60 120C30 120 25 114 25 108Z" fill={pc} />
    </svg>
  ),

  // 5. Turban / Pagri – wheat skin
  male_5: (pc = '#8e44ad') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#F3E5F5" />
      <circle cx="60" cy="56" r="25" fill="#E8C89E" />
      {/* Turban */}
      <ellipse cx="60" cy="30" rx="28" ry="20" fill="#C0392B" />
      <ellipse cx="60" cy="28" rx="24" ry="16" fill="#E74C3C" />
      <path d="M36 30C36 30 48 40 60 28C72 40 84 30 84 30" stroke="#A93226" strokeWidth="3" fill="none" />
      <ellipse cx="60" cy="20" rx="6" ry="4" fill="#F5B041" />
      <circle cx="50" cy="54" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="54" r="2.2" fill="#1a1a1a" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      {/* Light beard shadow */}
      <path d="M44 62C44 62 50 74 60 75C70 74 76 62 76 62" stroke="#5D4037" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M25 106C35 90 50 86 60 86C70 86 85 90 95 106C95 113 90 120 60 120C30 120 25 113 25 106Z" fill={pc} />
    </svg>
  ),

  // 6. Cap / Topi – light skin
  male_6: (pc = '#3498db') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E3F2FD" />
      <circle cx="60" cy="54" r="25" fill="#FDDCB5" />
      {/* Baseball cap */}
      <path d="M34 44C34 28 46 18 60 18C74 18 86 28 86 44L34 44Z" fill="#2C3E50" />
      <path d="M30 44C30 44 34 42 60 42C86 42 90 44 90 44C90 44 88 48 60 48C32 48 30 44 30 44Z" fill="#34495E" />
      <path d="M86 44C86 44 96 42 98 40" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="52" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2.2" fill="#1a1a1a" />
      <path d="M53 65C56 68 64 68 67 65" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 106C35 90 50 86 60 86C70 86 85 90 95 106C95 113 90 120 60 120C30 120 25 113 25 106Z" fill={pc} />
    </svg>
  ),

  // 7. Mohawk style – tan skin
  male_7: (pc = '#e74c3c') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FDECEA" />
      <circle cx="60" cy="54" r="25" fill="#D4A574" />
      {/* Mohawk */}
      <path d="M52 14C54 8 58 6 60 6C62 6 66 8 68 14C70 20 70 32 68 38L52 38C50 32 50 20 52 14Z" fill="#E74C3C" />
      <path d="M56 16C57 12 59 10 60 10C61 10 63 12 64 16C65 22 65 32 64 36L56 36C55 32 55 22 56 16Z" fill="#C0392B" />
      {/* Shaved sides */}
      <path d="M36 46C36 34 44 28 52 28L52 38C46 38 40 42 36 46Z" fill="#5D4037" opacity="0.3" />
      <path d="M84 46C84 34 76 28 68 28L68 38C74 38 80 42 84 46Z" fill="#5D4037" opacity="0.3" />
      <circle cx="50" cy="52" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2.2" fill="#1a1a1a" />
      <path d="M54 65C57 68 63 68 66 65" stroke="#B5785A" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 106C35 90 50 86 60 86C70 86 85 90 95 106C95 113 90 120 60 120C30 120 25 113 25 106Z" fill={pc} />
    </svg>
  ),

  // 8. Bald + mustache – dark skin
  male_8: (pc = '#f39c12') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FFF8E1" />
      <circle cx="60" cy="52" r="27" fill="#8D5524" />
      {/* Bald head shine */}
      <ellipse cx="54" cy="30" rx="8" ry="4" fill="#A0693C" opacity="0.5" />
      <circle cx="50" cy="50" r="2.5" fill="#0d0d0d" />
      <circle cx="70" cy="50" r="2.5" fill="#0d0d0d" />
      {/* Thick mustache */}
      <path d="M46 60C46 60 52 64 60 58C68 64 74 60 74 60" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M53 68C56 70 64 70 67 68" stroke="#6B3A1F" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 106C35 90 50 86 60 86C70 86 85 90 95 106C95 113 90 120 60 120C30 120 25 113 25 106Z" fill={pc} />
    </svg>
  ),

  // 9. Side-parted formal – olive skin
  male_9: (pc = '#1abc9c') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E0F2F1" />
      <circle cx="60" cy="54" r="25" fill="#C8A882" />
      {/* Side-parted hair */}
      <path d="M34 44C34 26 46 18 60 18C74 18 86 26 86 44C86 46 82 36 76 32C70 28 60 32 60 32C60 32 48 26 42 32C38 36 34 46 34 44Z" fill="#2C2C2C" />
      <path d="M42 38L34 44C34 40 36 34 42 30Z" fill="#3D3D3D" />
      <circle cx="50" cy="52" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2.2" fill="#1a1a1a" />
      {/* Eyebrows */}
      <path d="M44 46L54 44" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 44L76 46" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#A07855" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 106C35 90 50 86 60 86C70 86 85 90 95 106C95 113 90 120 60 120C30 120 25 113 25 106Z" fill={pc} />
      {/* Tie */}
      <path d="M57 86L60 100L63 86" fill="#E74C3C" />
    </svg>
  ),

  // 10. Spiky modern hair – light skin
  male_10: (pc = '#9b59b6') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#F3E5F5" />
      <circle cx="60" cy="56" r="24" fill="#FDDCB5" />
      {/* Spiky hair */}
      <path d="M38 40L42 18L48 36L52 12L58 34L62 10L68 34L72 14L78 36L82 20L84 40C84 40 78 30 60 30C42 30 38 40 38 40Z" fill="#4A148C" />
      <circle cx="50" cy="54" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="54" r="2.2" fill="#1a1a1a" />
      {/* Cheeky grin */}
      <path d="M50 66C54 72 66 72 70 66" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="42" cy="60" r="4" fill="#F8BBD0" opacity="0.4" />
      <circle cx="78" cy="60" r="4" fill="#F8BBD0" opacity="0.4" />
      <path d="M25 108C35 92 50 86 60 86C70 86 85 92 95 108C95 114 90 120 60 120C30 120 25 114 25 108Z" fill={pc} />
    </svg>
  ),

  // ═══════════════════════════════════════════════════════════════
  //  FEMALE AVATARS (female_1 → female_10)
  // ═══════════════════════════════════════════════════════════════

  // 1. Long straight hair – warm skin
  female_1: (pc = '#e8722a') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FCE8E6" />
      {/* Hair back – long */}
      <path d="M30 46C30 28 88 28 88 46V92C88 92 82 98 60 98C38 98 30 92 30 92V46Z" fill="#4A3B32" />
      <circle cx="60" cy="52" r="25" fill="#FCD5D0" />
      {/* Hair front */}
      <path d="M35 46C35 30 46 22 60 22C74 22 85 30 85 46C85 40 78 32 68 32C58 32 60 36 60 36C60 36 58 32 48 32C38 32 35 40 35 46Z" fill="#4A3B32" />
      <circle cx="50" cy="50" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="50" r="2.2" fill="#1a1a1a" />
      {/* Eyelashes */}
      <path d="M46 47L44 45" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <path d="M74 47L76 45" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <path d="M54 64C57 67 63 67 66 64" stroke="#C9786C" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 2. Curly hair + earrings – brown skin
  female_2: (pc = '#1a6b7a') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#EBF5F0" />
      <circle cx="60" cy="54" r="24" fill="#C68642" />
      {/* Curly hair */}
      <circle cx="38" cy="36" r="9" fill="#1C1A27" />
      <circle cx="50" cy="26" r="10" fill="#1C1A27" />
      <circle cx="70" cy="26" r="10" fill="#1C1A27" />
      <circle cx="82" cy="36" r="9" fill="#1C1A27" />
      <circle cx="60" cy="22" r="9" fill="#1C1A27" />
      <circle cx="34" cy="48" r="8" fill="#1C1A27" />
      <circle cx="86" cy="48" r="8" fill="#1C1A27" />
      <circle cx="36" cy="60" r="7" fill="#1C1A27" />
      <circle cx="84" cy="60" r="7" fill="#1C1A27" />
      {/* Earrings */}
      <circle cx="36" cy="68" r="3" fill="#F5B041" />
      <circle cx="84" cy="68" r="3" fill="#F5B041" />
      <circle cx="50" cy="52" r="2.2" fill="#0d0d0d" />
      <circle cx="70" cy="52" r="2.2" fill="#0d0d0d" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#A0693C" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 3. Braided hair – medium skin
  female_3: (pc = '#e91e63') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FCE4EC" />
      {/* Braid behind */}
      <path d="M70 70L75 80L70 90L75 100L72 110" stroke="#3E2723" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="54" r="24" fill="#D4A574" />
      {/* Hair top */}
      <path d="M36 48C36 28 46 20 60 20C74 20 84 28 84 48C84 42 76 32 60 32C44 32 36 42 36 48Z" fill="#3E2723" />
      {/* Parting */}
      <line x1="60" y1="20" x2="60" y2="34" stroke="#2E1B0E" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2" fill="#1a1a1a" />
      <path d="M54 64C57 67 63 67 66 64" stroke="#B5785A" strokeWidth="2" strokeLinecap="round" />
      {/* Bindi */}
      <circle cx="60" cy="40" r="1.5" fill="#E91E63" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 4. Hair bun + bindi – wheat skin
  female_4: (pc = '#ff9800') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FFF3E0" />
      <circle cx="60" cy="56" r="24" fill="#E8C89E" />
      {/* Bun on top */}
      <circle cx="60" cy="22" r="14" fill="#2C2C2C" />
      <circle cx="60" cy="20" r="10" fill="#3D3D3D" />
      {/* Hair sides */}
      <path d="M36 50C36 32 46 24 60 24C74 24 84 32 84 50C84 44 78 36 60 36C42 36 36 44 36 50Z" fill="#2C2C2C" />
      <circle cx="50" cy="54" r="2" fill="#1a1a1a" />
      <circle cx="70" cy="54" r="2" fill="#1a1a1a" />
      {/* Bindi */}
      <circle cx="60" cy="42" r="2" fill="#E53935" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      {/* Earrings */}
      <path d="M36 62L34 68L38 68Z" fill="#FF9800" />
      <path d="M84 62L82 68L86 68Z" fill="#FF9800" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 5. Hijab / headscarf – fair skin
  female_5: (pc = '#00897b') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E0F2F1" />
      {/* Hijab */}
      <path d="M28 50C28 26 42 14 60 14C78 14 92 26 92 50V80C92 80 86 90 60 90C34 90 28 80 28 80V50Z" fill="#00897B" />
      <path d="M32 50C32 28 44 18 60 18C76 18 88 28 88 50V76C88 76 82 86 60 86C38 86 32 76 32 76V50Z" fill="#00ACC1" />
      {/* Face */}
      <ellipse cx="60" cy="56" rx="22" ry="24" fill="#FCE5CD" />
      {/* Hijab front edge */}
      <path d="M38 46C38 34 48 28 60 28C72 28 82 34 82 46" stroke="#00897B" strokeWidth="4" fill="none" />
      <circle cx="50" cy="54" r="2" fill="#1a1a1a" />
      <circle cx="70" cy="54" r="2" fill="#1a1a1a" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 6. Short bob cut – light skin
  female_6: (pc = '#9c27b0') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#F3E5F5" />
      <circle cx="60" cy="54" r="24" fill="#FDDCB5" />
      {/* Bob cut hair */}
      <path d="M34 48C34 28 46 18 60 18C74 18 86 28 86 48V68C86 68 82 72 78 72C74 72 72 68 72 68L72 48" fill="#5D4037" />
      <path d="M34 48V68C34 68 38 72 42 72C46 72 48 68 48 68L48 48" fill="#5D4037" />
      <path d="M34 48C34 28 46 18 60 18C74 18 86 28 86 48C86 42 78 34 60 34C42 34 34 42 34 48Z" fill="#5D4037" />
      <circle cx="50" cy="52" r="2.2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2.2" fill="#1a1a1a" />
      {/* Lipstick */}
      <path d="M54 65C57 68 63 68 66 65" stroke="#E91E63" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 7. Ponytail with ribbon – tan skin
  female_7: (pc = '#ff5722') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FBE9E7" />
      {/* Ponytail behind */}
      <path d="M80 40C86 40 92 44 92 52C92 60 88 78 84 88" stroke="#3E2723" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="54" r="24" fill="#D4A574" />
      {/* Hair */}
      <path d="M36 48C36 28 46 20 60 20C74 20 84 28 84 48C84 42 76 32 60 32C44 32 36 42 36 48Z" fill="#3E2723" />
      {/* Ribbon */}
      <circle cx="82" cy="40" r="5" fill="#FF5722" />
      <path d="M78 36L74 28M86 36L90 28" stroke="#FF5722" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="52" r="2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2" fill="#1a1a1a" />
      <path d="M54 65C57 68 63 68 66 65" stroke="#B5785A" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 8. Wavy hair + glasses – fair skin
  female_8: (pc = '#607d8b') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#ECEFF1" />
      {/* Wavy hair back */}
      <path d="M30 48C30 28 42 18 60 18C78 18 90 28 90 48C90 60 88 78 84 88C80 78 82 60 82 48C82 36 72 26 60 26C48 26 38 36 38 48C38 60 40 78 36 88C32 78 30 60 30 48Z" fill="#8D6E63" />
      <circle cx="60" cy="54" r="24" fill="#FCE5CD" />
      {/* Hair front */}
      <path d="M36 48C36 30 46 22 60 22C74 22 84 30 84 48C84 42 76 34 60 34C44 34 36 42 36 48Z" fill="#8D6E63" />
      {/* Glasses */}
      <circle cx="48" cy="52" r="8" stroke="#333" strokeWidth="2" fill="none" />
      <circle cx="72" cy="52" r="8" stroke="#333" strokeWidth="2" fill="none" />
      <line x1="56" y1="52" x2="64" y2="52" stroke="#333" strokeWidth="2" />
      <circle cx="48" cy="52" r="2" fill="#1a1a1a" />
      <circle cx="72" cy="52" r="2" fill="#1a1a1a" />
      <path d="M54 66C57 68 63 68 66 66" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 9. Flower in hair – rosy skin
  female_9: (pc = '#4caf50') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#E8F5E9" />
      {/* Hair back */}
      <path d="M32 48C32 28 44 18 60 18C76 18 88 28 88 48V78C88 78 84 86 60 86C36 86 32 78 32 78V48Z" fill="#4A3B32" />
      <circle cx="60" cy="54" r="24" fill="#FCD5D0" />
      {/* Hair front */}
      <path d="M36 48C36 30 46 22 60 22C74 22 84 30 84 48C84 42 76 34 60 34C44 34 36 42 36 48Z" fill="#4A3B32" />
      {/* Flower */}
      <circle cx="82" cy="38" r="4" fill="#FF5252" />
      <circle cx="78" cy="34" r="3" fill="#FF8A80" />
      <circle cx="86" cy="34" r="3" fill="#FF8A80" />
      <circle cx="78" cy="42" r="3" fill="#FF8A80" />
      <circle cx="86" cy="42" r="3" fill="#FF8A80" />
      <circle cx="82" cy="38" r="2" fill="#FFEB3B" />
      <circle cx="50" cy="52" r="2" fill="#1a1a1a" />
      <circle cx="70" cy="52" r="2" fill="#1a1a1a" />
      <path d="M54 64C57 67 63 67 66 64" stroke="#C9786C" strokeWidth="2" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="42" cy="60" r="4" fill="#F8BBD0" opacity="0.35" />
      <circle cx="78" cy="60" r="4" fill="#F8BBD0" opacity="0.35" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // 10. Double braid pigtails – dark skin
  female_10: (pc = '#ff6f00') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#FFF8E1" />
      {/* Left braid */}
      <path d="M36 52L32 62L36 72L32 82L34 92" stroke="#1C1A27" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Right braid */}
      <path d="M84 52L88 62L84 72L88 82L86 92" stroke="#1C1A27" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Ribbon ties */}
      <circle cx="34" cy="92" r="3" fill="#FF6F00" />
      <circle cx="86" cy="92" r="3" fill="#FF6F00" />
      <circle cx="60" cy="54" r="24" fill="#8D5524" />
      {/* Hair */}
      <path d="M36 48C36 28 46 20 60 20C74 20 84 28 84 48C84 42 76 32 60 32C44 32 36 42 36 48Z" fill="#1C1A27" />
      {/* Middle parting */}
      <line x1="60" y1="20" x2="60" y2="34" stroke="#0d0d0d" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="2.2" fill="#0d0d0d" />
      <circle cx="70" cy="52" r="2.2" fill="#0d0d0d" />
      <path d="M54 66C57 69 63 69 66 66" stroke="#6B3A1F" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 106C36 92 50 87 60 87C70 87 84 92 92 106C92 113 88 120 60 120C32 120 28 113 28 106Z" fill={pc} />
    </svg>
  ),

  // ═══════════════════════════════════════════════════════════════
  //  NEUTRAL AVATAR
  // ═══════════════════════════════════════════════════════════════
  neutral: (pc = '#8fa8b3') => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <circle cx="60" cy="60" r="60" fill="#ECEFF1" />
      <circle cx="60" cy="48" r="22" fill="#B0BEC5" />
      <path d="M25 98C25 82 40 76 60 76C80 76 95 82 95 98C95 106 88 120 60 120C32 120 25 106 25 98Z" fill="#90A4AE" />
    </svg>
  ),
};

// ─── Helper: pick a random avatar key for a given gender ───
export const getRandomAvatar = (gender) => {
  if (gender === 'male') {
    return `male_${Math.floor(Math.random() * 10) + 1}`;
  }
  if (gender === 'female') {
    return `female_${Math.floor(Math.random() * 10) + 1}`;
  }
  return 'neutral';
};

// ─── Helper: list all avatar keys for a gender ───
export const getAvatarKeysForGender = (gender) => {
  if (gender === 'male') return Array.from({ length: 10 }, (_, i) => `male_${i + 1}`);
  if (gender === 'female') return Array.from({ length: 10 }, (_, i) => `female_${i + 1}`);
  return ['neutral'];
};

// ─── Avatar labels for the picker ───
export const AVATAR_LABELS = {
  male_1: 'Classic',
  male_2: 'Glasses',
  male_3: 'Bearded',
  male_4: 'Curly',
  male_5: 'Turban',
  male_6: 'Cap',
  male_7: 'Mohawk',
  male_8: 'Bald',
  male_9: 'Formal',
  male_10: 'Spiky',
  female_1: 'Long Hair',
  female_2: 'Curly',
  female_3: 'Braided',
  female_4: 'Hair Bun',
  female_5: 'Hijab',
  female_6: 'Bob Cut',
  female_7: 'Ponytail',
  female_8: 'Wavy',
  female_9: 'Flower',
  female_10: 'Pigtails',
  neutral: 'Default',
};

// ─── Main Avatar Component ───
const Avatar = ({ user, size = 'md', border = true, showBadge = true }) => {
  const role = user?.role || 'customer';
  const avatarKey = user?.avatar;
  const gender = user?.gender || '';

  const sizeMap = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;
  const primaryThemeColor = role === 'worker' ? '#e8722a' : '#1a6b7a';

  const renderAvatarContent = () => {
    // Custom uploaded image
    if (avatarKey && avatarKey.startsWith('data:image')) {
      return <img src={avatarKey} alt={user?.name || 'User'} className="avatar-img-content" />;
    }

    // Named default avatar
    if (avatarKey && DEFAULT_AVATARS[avatarKey]) {
      return DEFAULT_AVATARS[avatarKey](primaryThemeColor);
    }

    // Auto fallback based on gender
    if (gender === 'male') {
      return DEFAULT_AVATARS.male_1(primaryThemeColor);
    } else if (gender === 'female') {
      return DEFAULT_AVATARS.female_1(primaryThemeColor);
    }

    return DEFAULT_AVATARS.neutral(primaryThemeColor);
  };

  const isTeam = user?.workerType === 'team';

  return (
    <div className={`avatar-container ${currentSizeClass} ${border ? 'avatar-with-border' : ''} role-${role} ${isTeam ? 'avatar-team' : ''}`}>
      {renderAvatarContent()}
      
      {showBadge && role !== 'worker' && (
        <div className={`avatar-role-badge role-badge-${role}`}>
          <Briefcase size={size === 'xl' ? 20 : size === 'lg' ? 14 : 10} className="badge-icon" />
        </div>
      )}
    </div>
  );
};

export default Avatar;
