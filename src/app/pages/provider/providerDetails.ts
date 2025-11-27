export const providers = [
    {
      providerName: 'Bangkok General Hospital',
      code: 'H001',
      address: 'Downtown Street 42, Bangkok, Thailand',
      networkStatus: 'In Network',
      activeContracts: 2,
      details: {
        contracts: [
          {
            id: 'C-001',
            company: 'Allianz Life (AZAY)',
            productLine: 'IPD / OPD',
            effectiveDate: '2024-01-01',
            expiryDate: '2026-01-01',
            status: 'Active'
          },
          {
            id: 'C-002',
            company: 'Allianz General (AAGI)',
            productLine: 'A&H',
            effectiveDate: '2022-06-01',
            expiryDate: '2026-06-01',
            status: 'Active'
          }
        ],
        packages: [
          {
            id: 'PK-002',
            name: 'Appendectomy Package',
            coverageType: 'IPD (Life & A&H)',
            baseTariff: '45,000 THB',
            roomType: 'Shared',
          },
          {
            id: 'PK-003',
            name: 'Surgical Basic',
            coverageType: 'Surgical',
            baseTariff: '900 THB',
            roomType: 'Semi-private',
          }
        ],
        doctors: [
          { id: 'D-002', name: 'Dr. Sarah Connor', specialty: 'Gynecologist', status: 'Active' },
          { id: 'D-003', name: 'Dr. John Doe', specialty: 'Surgeon', status: 'Visiting' }
        ]
      }
    },
    {

      providerName: 'Chiang Mai International Hospital ',
      code: 'H014',
      address: 'Chiang Mai-Lampang Road, Chiang Mai, Thailand',  
      networkStatus: 'In Network',
      activeContracts: 1,
      details: {
        contracts: [    
          {
            id: 'C-010',
            company: 'Allianz Life (AZAY)',
            productLine: 'IPD',
            effectiveDate: '2023-03-01',
            expiryDate: '2025-03-01',
            status: 'Active'
          }
        ],
        packages: [
          {
            id: 'PK-010',             
            name: 'Appendectomy Basic Package',
            coverageType: 'IPD',
            baseTariff: '38,000 THB',
            roomType: 'Shared',
          },
          {

            id: 'PK-005',
            name: 'Pediatric Care',
            coverageType: 'Pediatrics',
            baseTariff: '30,000 THB',
            roomType: 'Shared', 
          }
        ],
        doctors: [  
          { id: 'D-004', name: 'Dr. Emily Clark', specialty: 'Obstetrician', status: 'Active' },
          { id: 'D-005', name: 'Dr. Michael Brown', specialty: 'Pediatrician', status: 'Visiting' }

        ]
      }    
      
    },
    {
      providerName: 'Samui Care Clinic',
      code: 'H022',
      address: '33 Sukhumvit 3, Wattana, Bangkok, Thailand',
      networkStatus: 'Out of Network',
      activeContracts: 0, 
      details: {
        contracts: [
          
        ],
        packages: [
        ],
        doctors: [
          { id: 'D-006', name: 'Dr. Anna Lee', specialty: 'Cardiologist', status: 'Active' },
          { id: 'D-007', name: 'Dr. David Kim', specialty: 'Neurologist', status: 'Active' }
        ]
        }
    },
    {
      providerName: 'Vejthani Hospital',
      code: 'H005',
      address: '1 Ladprao 111, Bangkok, Thailand',
      networkStatus: 'In Network',
      activeContracts: 3,
      details: {
        contracts: [
          {
            id: 'C-008',  
            company: 'Allianz Life (AZAY)',
            productLine: 'IPD / OPD',
            effectiveDate: '2022-02-01',  
            expiryDate: '2025-02-01',
            status: 'Active'  
          },
          {
            id: 'C-009',  
            company: 'Allianz General (AAGI)',

            productLine: 'A&H',
            effectiveDate: '2021-08-01',
            expiryDate: '2024-08-01',   
            status: 'Expiring soon'
          },
          {
            id: 'C-010',
            company: 'Allianz Life (AZAY)',
            productLine: 'Maternity',
            effectiveDate: '2023-04-01',
            expiryDate: '2026-04-01',
            status: 'Active'
          }
        ],
        packages: [
          {
            id: 'PK-009',
            name: 'Comprehensive Maternity',
            coverageType: 'Maternity',
            baseTariff: '200,000 THB',
            roomType: 'Private',
          },
          {
            id: 'PK-010', 
            name: 'Orthopedic Care',
            coverageType: 'Orthopedics',
            baseTariff: '75,000 THB',
            roomType: 'Semi-private',
          }
        ],
        doctors: [
          { id: 'D-010', name: 'Dr. Michael Brown', specialty: 'Orthopedic Surgeon', status: 'Active' },
          { id: 'D-011', name: 'Dr. Susan Green', specialty: 'Maternity Specialist', status: 'Active' }
        ]
      }
    }
  ];