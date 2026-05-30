/**
 * Mock data for demonstrating functionality without database connection
 */

window.MOCK_DATA = {
  // Mock document analysis data for Section 8
  esgDocumentAnalysis: {
    documentId: "mock_doc_12345",
    documentName: "ESG_Report_2024.pdf",
    fileType: "pdf",
    fileSize: 2458624, // ~2.4MB
    uploadedAt: new Date().toISOString(),

    // ESG domain classification
    esgClassification: {
      domains: ['E', 'S', 'G'],
      confidence: 'high',
      explanation: 'The document contains information on all three ESG domains: environmental indicators (CO2 emissions, energy consumption), social aspects (working conditions, diversity), and governance (anti-corruption policy).'
    },

    // ISO standards compliance analysis
    isoCompliance: {
      applicableStandards: ['ISO_14001', 'ISO_26000', 'ISO_37001'],

      complianceResults: {
        ISO_14001: {
          standardId: 'ISO_14001',
          standardName: 'Environmental Management Systems',
          coveragePercent: 78,
          totalMandatoryRequirements: 42,
          coveredMandatoryRequirements: 33,
          requirements: [
            {
              id: 'ISO_14001_4.1',
              title: 'Understanding the organization and its context',
              status: 'compliant',
              mandatory: true,
              textFragments: [
                {
                  text: '...analysis of external and internal factors affecting the environmental management system...',
                  context: 'Section 2.1',
                  indicators: ['analysis', 'factors', 'management system']
                }
              ]
            },
            {
              id: 'ISO_14001_6.1',
              title: 'Actions to address risks and opportunities',
              status: 'compliant',
              mandatory: true,
              textFragments: [
                {
                  text: '...identification of environmental risks and opportunities, action plan for 2024-2025...',
                  context: 'Section 3.2',
                  indicators: ['risks', 'opportunities', 'action plan']
                }
              ]
            },
            {
              id: 'ISO_14001_8.1',
              title: 'Operational planning and control',
              status: 'partial',
              mandatory: true,
              textFragments: [
                {
                  text: '...operational control procedures are mentioned, but without detail...',
                  context: 'Section 4.1',
                  indicators: ['control', 'procedures']
                }
              ]
            },
            {
              id: 'ISO_14001_9.1',
              title: 'Monitoring, measurement, analysis and evaluation',
              status: 'non_compliant',
              mandatory: true,
              textFragments: []
            }
          ]
        },

        ISO_26000: {
          standardId: 'ISO_26000',
          standardName: 'Social Responsibility',
          coveragePercent: 65,
          totalMandatoryRequirements: 38,
          coveredMandatoryRequirements: 25,
          requirements: [
            {
              id: 'ISO_26000_6.2',
              title: 'Human rights',
              status: 'compliant',
              mandatory: true,
              textFragments: [
                {
                  text: '...human rights compliance policy, staff training, complaint handling procedures...',
                  context: 'Section 5.1',
                  indicators: ['human rights', 'training', 'procedures']
                }
              ]
            },
            {
              id: 'ISO_26000_6.4',
              title: 'Labour practices',
              status: 'compliant',
              mandatory: true,
              textFragments: [
                {
                  text: '...working conditions meet international standards, staff turnover 12%...',
                  context: 'Section 5.3',
                  indicators: ['working conditions', '12%', 'standards']
                }
              ]
            },
            {
              id: 'ISO_26000_6.7',
              title: 'Consumer issues',
              status: 'partial',
              mandatory: false,
              textFragments: [
                {
                  text: '...customer relations are mentioned, but without specific consumer protection procedures...',
                  context: 'Section 6.2',
                  indicators: ['customers']
                }
              ]
            }
          ]
        },

        ISO_37001: {
          standardId: 'ISO_37001',
          standardName: 'Anti-Bribery Management Systems',
          coveragePercent: 52,
          totalMandatoryRequirements: 35,
          coveredMandatoryRequirements: 18,
          requirements: [
            {
              id: 'ISO_37001_5.1',
              title: 'Leadership and commitment',
              status: 'compliant',
              mandatory: true,
              textFragments: [
                {
                  text: '...company leadership demonstrates commitment to anti-corruption policy, CEO statement signed...',
                  context: 'Section 1.2',
                  indicators: ['leadership', 'policy', 'statement']
                }
              ]
            },
            {
              id: 'ISO_37001_8.2',
              title: 'Due diligence',
              status: 'partial',
              mandatory: true,
              textFragments: [
                {
                  text: '...counterparty verification is mentioned, but detailed procedure is not described...',
                  context: 'Section 7.1',
                  indicators: ['verification', 'counterparties']
                }
              ]
            },
            {
              id: 'ISO_37001_8.9',
              title: 'Raising concerns',
              status: 'non_compliant',
              mandatory: true,
              textFragments: []
            }
          ]
        }
      },

      overallCoveragePercent: 65,
      summary: {
        totalRequirements: 115,
        compliant: 56,
        partial: 17,
        nonCompliant: 42,
        notFound: 0
      }
    },

    // Extracted text (shortened version for demo)
    fullText: `
      ESG REPORT 2024

      1. ENVIRONMENTAL RESPONSIBILITY
      Our company strives to minimize environmental impact.
      In 2024, CO2 emissions amounted to 1,250 tons, which is 15% less than the 2023 figure.
      The share of renewable energy increased to 35%.

      2. SOCIAL RESPONSIBILITY
      We ensure safe working conditions for all employees.
      The gender pay gap has been reduced to 8%.
      Training and development programs for staff have been implemented.

      3. CORPORATE GOVERNANCE
      Anti-corruption policy and code of ethics have been implemented.
      The board of directors includes independent members (40%).
      Regular audits of the risk management system.
    `.trim()
  },

  // Mock benchmarks for Section 7
  companyBenchmarks: {
    'Technology': [
      {
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        scope1: 145.8, // tons CO2
        ren: 42.5,     // % renewable energy
        paygap: 11.2   // % pay gap
      },
      {
        companyName: 'Digital Innovations Ltd',
        industry: 'Technology',
        scope1: 198.3,
        ren: 38.7,
        paygap: 14.5
      },
      {
        companyName: 'CloudTech Systems',
        industry: 'Technology',
        scope1: 112.5,
        ren: 55.2,
        paygap: 9.8
      }
    ],
    'Manufacturing': [
      {
        companyName: 'Industrial Group A',
        industry: 'Manufacturing',
        scope1: 2345.6,
        ren: 28.3,
        paygap: 18.7
      },
      {
        companyName: 'Production Inc',
        industry: 'Manufacturing',
        scope1: 1890.2,
        ren: 31.5,
        paygap: 15.2
      },
      {
        companyName: 'Manufacturing Solutions',
        industry: 'Manufacturing',
        scope1: 2678.9,
        ren: 25.8,
        paygap: 20.1
      }
    ],
    'Finance': [
      {
        companyName: 'Global Bank Corp',
        industry: 'Finance',
        scope1: 89.4,
        ren: 62.3,
        paygap: 16.8
      },
      {
        companyName: 'Investment Group',
        industry: 'Finance',
        scope1: 76.2,
        ren: 58.9,
        paygap: 14.3
      },
      {
        companyName: 'Financial Services Ltd',
        industry: 'Finance',
        scope1: 95.7,
        ren: 65.1,
        paygap: 12.9
      }
    ],
    'Retail': [
      {
        companyName: 'Retail Chain XYZ',
        industry: 'Retail',
        scope1: 456.8,
        ren: 33.4,
        paygap: 13.6
      },
      {
        companyName: 'Shopping Network',
        industry: 'Retail',
        scope1: 523.1,
        ren: 29.7,
        paygap: 15.9
      }
    ],
    'Healthcare': [
      {
        companyName: 'Medical Center Group',
        industry: 'Healthcare',
        scope1: 234.5,
        ren: 41.2,
        paygap: 11.8
      },
      {
        companyName: 'Healthcare Solutions',
        industry: 'Healthcare',
        scope1: 198.7,
        ren: 45.6,
        paygap: 10.3
      }
    ],
    'construction': [
      {
        companyName: 'Skanska And',
        industry: 'construction',
        scope1: 4324.0,
        ren: 45.2,
        paygap: 18.0
      },
      {
        companyName: 'Essential Bouygues Construction',
        industry: 'construction',
        scope1: 3850.5,
        ren: 42.1,
        paygap: 15.3
      },
      {
        companyName: 'Hochtief Group Double Materiality Assessment',
        industry: 'construction',
        scope1: 5120.8,
        ren: 38.7,
        paygap: 16.5
      },
      {
        companyName: 'Sprawozdanie Z Dzialalnosci Grupy Budimex I Budir',
        industry: 'construction',
        scope1: 2980.3,
        ren: 35.4,
        paygap: 14.8
      },
      {
        companyName: 'Tokyo',
        industry: 'construction',
        scope1: 2150.6,
        ren: 52.3,
        paygap: 12.4
      }
    ],
    'Construction': [
      {
        companyName: 'Skanska And',
        industry: 'Construction',
        scope1: 4324.0,
        ren: 45.2,
        paygap: 18.0
      },
      {
        companyName: 'Essential Bouygues Construction',
        industry: 'Construction',
        scope1: 3850.5,
        ren: 42.1,
        paygap: 15.3
      },
      {
        companyName: 'Hochtief Group Double Materiality Assessment',
        industry: 'Construction',
        scope1: 5120.8,
        ren: 38.7,
        paygap: 16.5
      },
      {
        companyName: 'Sprawozdanie Z Dzialalnosci Grupy Budimex I Budir',
        industry: 'Construction',
        scope1: 2980.3,
        ren: 35.4,
        paygap: 14.8
      },
      {
        companyName: 'Tokyo',
        industry: 'Construction',
        scope1: 2150.6,
        ren: 52.3,
        paygap: 12.4
      }
    ]
  },

  // Mock user data
  userData: {
    sessionId: `mock_session_${Date.now()}`,
    companyName: 'Demo Company Ltd',
    industry: 'Technology',
    esgLevel: 'advanced',
    language: 'en',
    customData: {
      completedSections: [],
      lastUpdated: new Date().toISOString()
    }
  },

  // Placeholders for different states
  placeholders: {
    section8: {
      noDocument: {
        title: 'Document not uploaded',
        message: 'Upload an ESG document to get detailed ISO standards compliance analysis',
        icon: '📄',
        action: 'Upload document'
      },
      analyzing: {
        title: 'Analyzing document',
        message: 'Please wait. We are analyzing the document and checking ISO standards compliance...',
        icon: '⏳',
        progress: true
      },
      ready: {
        title: 'Analysis completed',
        message: 'Document successfully analyzed. Results are available below.',
        icon: '✅'
      }
    },
    section7: {
      noBenchmarks: {
        title: 'Comparison data not loaded',
        message: 'Select an industry and load data to compare your company with competitors',
        icon: '📊',
        action: 'Load benchmarks'
      },
      ready: {
        title: 'Data loaded',
        message: 'Data available for comparing companies in the selected industry',
        icon: '✅'
      }
    },
    general: {
      error: {
        title: 'Error',
        message: 'An error occurred while loading data. Please try again later.',
        icon: '❌'
      },
      loading: {
        title: 'Loading',
        message: 'Loading data...',
        icon: '⏳',
        progress: true
      }
    }
  }
};

// Flag for using mock data (can be toggled)
window.USE_MOCK_DATA = true;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.MOCK_DATA;
}

// Mock data initialization complete
