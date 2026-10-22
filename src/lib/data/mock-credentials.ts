import { W3CCredential } from '@/lib/types/credential';

export interface PresetCredentialOption {
  id: string;
  label: string;
  subtitle: string;
  credential: W3CCredential;
}

export const PRESET_CREDENTIALS: PresetCredentialOption[] = [
  {
    id: 'rajesh-raut',
    label: 'Rajesh S. Raut (8.45 CGPA)',
    subtitle: 'B.Tech CSE - First Class with Distinction (RTMNU)',
    credential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://autocert-zkp.org/contexts/zk-v1.jsonld',
      ],
      id: 'urn:uuid:7f89b41a-289b-4e12-88ef-912384910245',
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: 'did:rtmnu:registrar',
        name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
        code: 'RTMNU-NAGPUR',
      },
      issuanceDate: '2026-06-15T10:00:00Z',
      credentialSubject: {
        id: 'urn:student:rtmnu:2022:en:78291',
        studentName: 'RAJESH S. RAUT',
        enrollmentNumber: 'RTMNU/2022/EN/78291',
        degree: 'Bachelor of Technology (B.Tech)',
        branch: 'Computer Science & Engineering',
        institution: 'Department of Computer Technology, RTMNU Main Campus',
        graduationYear: 2026,
        classification: 'First Class with Distinction',
        cgpa: 8.45,
      },
      zkSubject: {
        actualCgpaScaled: 845,
        studentSecret: '928374928374928374928374928374928374928374',
        commitment: '18227611694518558990911742405902426398314928214388426570222731077222811948915',
        hashAlgorithm: 'Poseidon(2)',
      },
      proof: {
        type: 'PoseidonMerkleProof2026',
        merkleRoot: '2019485729104857291048572910485729104857291048572910485729104857',
        batchId: 'BATCH-2026-RTMNU-UG-01',
        created: '2026-06-15T12:30:00Z',
      },
    },
  },
  {
    id: 'snehal-deshmukh',
    label: 'Snehal M. Deshmukh (7.60 CGPA)',
    subtitle: 'B.E. Electronics - First Class (RCOEM / RTMNU)',
    credential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://autocert-zkp.org/contexts/zk-v1.jsonld',
      ],
      id: 'urn:uuid:3b29c910-1847-49f2-8921-817264819203',
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: 'did:rtmnu:registrar',
        name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
        code: 'RTMNU-NAGPUR',
      },
      issuanceDate: '2026-06-15T10:00:00Z',
      credentialSubject: {
        id: 'urn:student:rtmnu:2022:en:65104',
        studentName: 'SNEHAL M. DESHMUKH',
        enrollmentNumber: 'RTMNU/2022/EN/65104',
        degree: 'Bachelor of Engineering (B.E.)',
        branch: 'Electronics & Telecommunication Engineering',
        institution: 'Shri Ramdeobaba College of Engineering & Management',
        graduationYear: 2026,
        classification: 'First Class',
        cgpa: 7.6,
      },
      zkSubject: {
        actualCgpaScaled: 760,
        studentSecret: '184920492810485920194829104857291048572910',
        commitment: '327831113192225511137438653003757481068048679092166236692083864227884697505',
        hashAlgorithm: 'Poseidon(2)',
      },
      proof: {
        type: 'PoseidonMerkleProof2026',
        merkleRoot: '2019485729104857291048572910485729104857291048572910485729104857',
        batchId: 'BATCH-2026-RTMNU-UG-01',
        created: '2026-06-15T12:30:00Z',
      },
    },
  },
  {
    id: 'tanmay-agrawal',
    label: 'Tanmay K. Agrawal (9.15 CGPA)',
    subtitle: 'M.Tech AI & Data Science - Distinction (GCOEN)',
    credential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://autocert-zkp.org/contexts/zk-v1.jsonld',
      ],
      id: 'urn:uuid:91823746-5829-4102-9847-192837465019',
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: 'did:rtmnu:registrar',
        name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
        code: 'RTMNU-NAGPUR',
      },
      issuanceDate: '2026-06-18T14:00:00Z',
      credentialSubject: {
        id: 'urn:student:rtmnu:2024:pg:3109',
        studentName: 'TANMAY K. AGRAWAL',
        enrollmentNumber: 'RTMNU/2024/PG/3109',
        degree: 'Master of Technology (M.Tech)',
        branch: 'Artificial Intelligence & Data Science',
        institution: 'Govt College of Engineering, Nagpur',
        graduationYear: 2026,
        classification: 'First Class with Distinction',
        cgpa: 9.15,
      },
      zkSubject: {
        actualCgpaScaled: 915,
        studentSecret: '739201948572910485729104857291048572910485',
        commitment: '16480744674941707506219427542750231867632301079575489435818481894869178836865',
        hashAlgorithm: 'Poseidon(2)',
      },
      proof: {
        type: 'PoseidonMerkleProof2026',
        merkleRoot: '2019485729104857291048572910485729104857291048572910485729104857',
        batchId: 'BATCH-2026-RTMNU-PG-01',
        created: '2026-06-18T15:00:00Z',
      },
    },
  },
  {
    id: 'under-threshold-test',
    label: 'Under-Threshold Test (6.20 CGPA)',
    subtitle: 'Demonstrates mathematical constraint rejection when threshold > CGPA',
    credential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://autocert-zkp.org/contexts/zk-v1.jsonld',
      ],
      id: 'urn:uuid:10293847-5647-4839-2910-482910485729',
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: 'did:rtmnu:registrar',
        name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
        code: 'RTMNU-NAGPUR',
      },
      issuanceDate: '2026-06-15T10:00:00Z',
      credentialSubject: {
        id: 'urn:student:rtmnu:2022:en:11928',
        studentName: 'DEMO UNDER-THRESHOLD STUDENT',
        enrollmentNumber: 'RTMNU/2022/EN/11928',
        degree: 'Bachelor of Technology (B.Tech)',
        branch: 'Mechanical Engineering',
        institution: 'RTMNU Affiliated College',
        graduationYear: 2026,
        classification: 'Second Class',
        cgpa: 6.2,
      },
      zkSubject: {
        actualCgpaScaled: 620,
        studentSecret: '381920485719204857192048571920485719204857',
        commitment: '19325636518724925649485578208199427389160222587505764246177247605596676418964',
        hashAlgorithm: 'Poseidon(2)',
      },
      proof: {
        type: 'PoseidonMerkleProof2026',
        merkleRoot: '2019485729104857291048572910485729104857291048572910485729104857',
        batchId: 'BATCH-2026-RTMNU-UG-01',
        created: '2026-06-15T12:30:00Z',
      },
    },
  },
];
