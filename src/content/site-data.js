/**
 * Dữ liệu có cấu trúc của hệ thống website Skillcetera (Trang chủ + 6 Subpage + Content Studio).
 * Đồng bộ tự động từ public/data/content.json.
 */

export const SITE_META = {
  "clubName": "Skillcetera",
  "fullName": "Skills and Languages Club",
  "institution": "FPT University Ho Chi Minh City",
  "foundedYear": "2020",
  "taglineEn": "Ideas worth spreading. Knowledge worth sharing.",
  "taglineVi": "Ideas worth spreading. Knowledge worth sharing.",
  "heroLeadVi": "Skills and Languages Club at FPT University Ho Chi Minh City — where ideas are heard and large-scale experiences are created together.",
  "heroImage": "/assets/615707596_1406518118150927_8099910856454498230_n-mvmf0nkw.webp",
  "heroOriginalImage": "/assets/originals/615707596_1406518118150927_8099910856454498230_n-mvmf0nkw.jpg",
  "heroImageAlt": "Skillcetera Archival Photo",
  "heroImageCaption": "skillcetera. — Learn together, make an impact.",
  "retrievedDate": "2026-10-24",
  "recruitment": {
    "status": "closed",
    "cohort": "2024–2025",
    "badgeVi": "RECRUITMENT STATUS: 2024–2025 COHORT CLOSED · NEW COHORT PENDING ANNOUNCEMENT",
    "noteVi": "The 2024–2025 recruitment cohort has concluded. When the next cohort opens, official application forms will be activated on the Join Us page (/join). In the meantime, feel free to contact us directly via email.",
    "departments": [
      {
        "id": "event",
        "name": "Event Department",
        "tag": "Sản xuất & Vận hành Onsite",
        "desc": "Chịu trách nhiệm toàn diện về trang thiết bị, cơ sở vật chất, hậu cần và là lực lượng nòng cốt điều phối trực tiếp tại các sự kiện lớn như ESC và TEDxFPTUniversityHCMC.",
        "responsibilities": [
          "Nắm thông tin về vật dụng, cơ sở vật chất, mối quan hệ, nguồn lực trong trường và các nhà thầu, nhà cung cấp, dịch vụ bên ngoài trường có thể mượn/sử dụng/thuê.",
          "Kiểm kê số lượng, vị trí, tình trạng của vật dụng, cơ sở vật chất mượn từ trường trước và sau khi mượn.",
          "Lập checklist chi tiết và phân bổ nhân sự cho ngày on-site.",
          "Đóng góp, tiếp nhận ý tưởng để setup không gian ngày onsite.",
          "Phân chia quà từ trường và sponsor; đảm bảo quà tặng đến đúng đối tượng trong ngày onsite.",
          "Kiểm tra, thu thập giấy tờ và báo giá vật phẩm phục vụ sự kiện.",
          "Hỗ trợ team Account lập kế hoạch và thủ tục gửi phòng PDP.",
          "Là nhân lực chính chạy và điều phối onsite tại các sự kiện."
        ],
        "requirements": [
          "Nắm được các yêu cầu của các loại giấy tờ, văn bản, tài liệu hành chính cần thiết.",
          "Có khả năng giao tiếp, chủ động tìm kiếm các nhà cung cấp phù hợp với mục đích dự án.",
          "Có tinh thần trách nhiệm cao, đặc biệt vào những ngày sát sự kiện.",
          "Biết cách lập các checklist khoa học để đảm bảo sự kiện suôn sẻ.",
          "Năng lượng cao, sức chịu đựng tốt, độc lập và nhanh nhạy.",
          "Cần có sự tỉ mỉ, chu đáo, trung thực trong dự án."
        ],
        "skills": "Logistics, Onsite Operation, Checklist Management, Vendor Coordination",
        "focus": "Event & Stage Operations"
      },
      {
        "id": "account",
        "name": "Account Department",
        "tag": "Đối ngoại Học đường & Quản lý Dự án",
        "desc": "Đầu mối ngoại giao và hành chính chiến lược, chịu trách nhiệm kết nối trực tiếp với phòng PDP, quản lý thanh toán, hợp đồng và chăm sóc diễn giả, đối tác tổ chức.",
        "responsibilities": [
          "Làm việc với phòng PDP: Trao đổi thông tin với cán bộ PDP về các dự án của CLB, thực hiện nghĩa vụ thanh toán và thủ tục mượn cơ sở vật chất.",
          "Kiểm kê các giấy tờ thanh toán, hợp đồng với các đối tác đảm bảo tránh sai sót và sự cố diễn ra.",
          "Trực tiếp liên lạc, làm việc với các diễn giả, câu lạc bộ, và tổ chức bên ngoài để đảm bảo quyền lợi hai bên, giúp sự kiện diễn ra suôn sẻ, tốt đẹp.",
          "Trong trường hợp bất khả kháng, ban Account có thể bù lấp vị trí còn thiếu ở một số ban khác."
        ],
        "requirements": [
          "Biết viết Email, làm báo cáo cũng như các bản kế hoạch dự án chỉn chu.",
          "Biết làm nội dung và xây dựng ý tưởng cho các sự kiện và dự án.",
          "Có khả năng trình bày, thuyết trình tốt trước mọi người.",
          "Có kinh nghiệm liên quan là một lợi thế."
        ],
        "skills": "Stakeholder Management, Official Documentation, Negotiation, Presentation",
        "focus": "School Relations & Partner Protocol"
      },
      {
        "id": "sponsorship",
        "name": "Sponsorship Department",
        "tag": "Tài trợ & Phát triển Đối tác",
        "desc": "Khai phá và duy trì nguồn lực tài chính, hiện vật; xây dựng hồ sơ tài trợ và đàm phán hợp tác bền vững với các doanh nghiệp đồng hành cùng Skillcetera.",
        "responsibilities": [
          "Xây dựng và hoàn thiện hồ sơ tài trợ (Sponsorship Proposal) chuyên nghiệp.",
          "Nghiên cứu và tìm kiếm Nhà tài trợ tiềm năng phù hợp với từng dự án.",
          "Phát triển và duy trì mối quan hệ với Nhà tài trợ (đàm phán ký hợp đồng, hỗ trợ tại ngày onsite, theo dõi quyền lợi, liên lạc qua email/zalo...).",
          "Chuẩn bị các giấy tờ liên quan trong quá trình làm việc với Nhà tài trợ (hợp đồng tài trợ, biên bản xác nhận, file theo dõi quyền lợi, hợp đồng nghiệm thu...).",
          "Theo dõi và đảm bảo quyền lợi cho Nhà tài trợ trong suốt quá trình hợp tác.",
          "Làm việc và phối hợp chặt chẽ với các ban khác (Admin, Account, Event...)."
        ],
        "requirements": [
          "Có khả năng tìm kiếm và quản lí thông tin.",
          "Có tính kiên trì và ham học hỏi.",
          "Có kỹ năng trong giao tiếp, đàm phán và thiết kế là một lợi thế."
        ],
        "skills": "Sponsorship Pitching, Contract Negotiation, CRM, Partner Deliverables",
        "focus": "Fundraising & Corporate Partnerships"
      },
      {
        "id": "admin",
        "name": "Admin Department",
        "tag": "Quản trị Nhân sự & Vận hành Nội bộ",
        "desc": "Trục xương sống quản trị nội bộ của CLB, quản lý cơ sở dữ liệu thành viên, đảm bảo chính sách quyền lợi, tổ chức tuyển quân và gìn giữ văn hóa gắn kết Skillcetera.",
        "responsibilities": [
          "Quản lý thông tin thành viên, tuyển thành viên & cộng tác viên mới.",
          "Cập nhật liên tục Database của Câu lạc bộ.",
          "Thông báo, quản lý các nhiệm vụ truyền thông hoặc thông tin sự kiện, dự án quan trọng đến các thành viên.",
          "Đảm bảo các chính sách quyền lợi của thành viên được thực hiện đúng và đầy đủ.",
          "Kiểm tra và ghi nhận hoạt động của các thành viên trong CLB.",
          "Giải quyết các vấn đề, tâm tư giữa các thành viên trong câu lạc bộ.",
          "Phối hợp với team Event lên kế hoạch tổ chức các sự kiện gắn kết thành viên (bonding, retreat...)."
        ],
        "requirements": [
          "Biết viết email, làm báo cáo và kế hoạch rõ ràng.",
          "Tỉ mỉ, cẩn thận, có khả năng giao tiếp tốt.",
          "Có khả năng về quản lý database.",
          "Biết sử dụng Notion là một lợi thế.",
          "Biết kiến thức lập trình website là một lợi thế."
        ],
        "skills": "Database Management, HR Operations, Internal Communication, Notion, Web Basics",
        "focus": "Human Resources & Internal Operations"
      },
      {
        "id": "media",
        "name": "Media Department",
        "tag": "Truyền thông & Đa phương tiện",
        "desc": "Khối sáng tạo đa phương tiện phụ trách thiết kế nhận diện thương hiệu, hoạch định chiến lược nội dung, sản xuất hình ảnh và dựng video cho toàn bộ các kênh của Skillcetera.",
        "roles": [
          {
            "title": "Vị trí 1: Designer",
            "tag": "Graphic & Brand Identity",
            "duties": [
              "Thiết kế các ấn phẩm truyền thông (social post, banner, standee, merchandise, backdrop...).",
              "Thiết kế bộ nhận diện thương hiệu độc bản cho các sự kiện của CLB."
            ],
            "requirements": [
              "Có kỹ năng về đồ hoạ, tư duy thiết kế tốt.",
              "Sử dụng thành thạo Canva.",
              "Biết sử dụng Photoshop, Illustrator là một lợi thế."
            ]
          },
          {
            "title": "Vị trí 2: Content and Planning",
            "tag": "Strategy & Content Writing",
            "duties": [
              "Xây dựng kế hoạch truyền thông trong các kỳ học của CLB.",
              "Lên chiến lược marketing (sáng tạo những hình thức truyền thông mới lạ, phù hợp với tính chất từng sự kiện và đồng nhất).",
              "Xây dựng nội dung cho các bài đăng truyền thông, những kế hoạch truyền thông trong các kỳ học của CLB.",
              "Viết content đăng trên kênh truyền thông của CLB."
            ],
            "requirements": [
              "Sử dụng tốt Google Suite (Google Docs, Sheet,...).",
              "Có khả năng quản lí, lên kế hoạch tốt cho truyền thông.",
              "Luôn cập nhật xu hướng mới.",
              "Ngôn ngữ diễn đạt tốt, sáng tạo và chủ động bắt trend.",
              "Có khả năng nghiên cứu và phân tích các nội dung mới."
            ]
          },
          {
            "title": "Vị trí 3: Production team (Chụp hình & Hậu kỳ)",
            "tag": "Photo & Video Production",
            "duties": [
              "Photographer: Chụp và xử lý hậu kỳ hình ảnh của các sự kiện của CLB.",
              "Video Editor: Edit video đăng tải trên các nền tảng mạng xã hội; Đảm bảo chất lượng video tốt, thu hút người xem; Hỗ trợ các công việc edit video khác theo từng kế hoạch."
            ],
            "requirements": [
              "Photographer: Có máy ảnh cá nhân; Xử lý hậu kỳ sau mỗi buổi chụp ảnh (chỉnh sửa và tối ưu hóa ảnh đảm bảo chất lượng); Siêng năng, chịu khó học hỏi, đam mê sáng tạo.",
              "Video Editor: Có kinh nghiệm làm việc trong lĩnh vực edit video (Ưu tiên); Thông thạo ít nhất 1 phần mềm dựng (Premiere Pro, DaVinci Resolve, CapCut…); Có niềm yêu thích nghệ thuật, điện ảnh; Thái độ tốt, khiêm tốn và chủ động; Cập nhật nhanh xu hướng mạng xã hội."
            ]
          }
        ],
        "skills": "Brand Identity, Copywriting, Photo Editing, Video Editing, Social Trends",
        "focus": "Content, Creative Design & Visual Media"
      }
    ]
  },
  "contact": {
    "clubEmail": "skillcetera@gmail.com",
    "tedxEmail": "tedxfptuniversityhcmc@gmail.com",
    "address": "FPT University Ho Chi Minh City — Lot E2a-7, D1 Street, Saigon Hi-Tech Park, Long Thanh My Ward, Thu Duc City, HCMC",
    "contacts": [
      {
        "name": "Mr. Loc",
        "role": "Executive Board & Club Contact",
        "email": "locnt.skillcetera@gmail.com"
      },
      {
        "name": "Ms. Hoan My",
        "role": "Executive Board & Club Contact",
        "email": "mynth.skillcetera@gmail.com"
      },
      {
        "name": "Ms. Chinh",
        "role": "Executive Board & Club Contact",
        "email": "chinhk.skillcetera@gmail.com"
      }
    ],
    "social": [
      {
        "label": "Facebook Skillcetera",
        "url": "https://www.facebook.com/skillcetera"
      },
      {
        "label": "Instagram Skillcetera",
        "url": "https://www.instagram.com/skillcetera/"
      },
      {
        "label": "YouTube Skillcetera",
        "url": "https://www.youtube.com/@skillcetera"
      }
    ],
    "subpages": [
      {
        "label": "Join Us",
        "url": "/join"
      },
      {
        "label": "Studio (Admin)",
        "url": "/studio"
      }
    ]
  },
  "heroImagePosition": "87% 88%",
  "heroImageFit": "cover",
  "heroPill": "SKILLS & LANGUAGES CLUB · FPTU HCMC",
  "heroTitle": "Consistency is <em>flexibility.</em>",
  "heroCtaPrimaryText": "Explore Events",
  "heroCtaPrimaryLink": "#esc",
  "heroCtaSecondaryText": "About Skillcetera",
  "heroCtaSecondaryLink": "#about",
  "heroImageCredit": "IDEAS WORTH SPREADING · KNOWLEDGE WORTH SHARING",
  "aboutPill": "ABOUT US · THREE CORE MISSIONS",
  "aboutTitle": "Learn. Connect.<br><em>Make an impact.</em>",
  "aboutLead": "Skillcetera - Skills and Languages Club is not just an academic club; it is a vibrant event-organizing hub that empowers students to thrive through the exchange of knowledge, skills, and experiences. Our vision is to create an engaging environment where creativity and collaboration flourish, allowing members to enhance their knowledge and develop essential skills in a supportive community."
};
export const MISSIONS = [
  {
    "index": "01",
    "titleEn": "Consistency is Flexibility",
    "titleVi": "Consistency is Flexibility",
    "descriptionVi": "Building a knowledge-sharing community that nurtures ideas daily, using consistency as the foundation to unlock flexible adaptability.",
    "detailVi": "At Skillcetera, we act as a catalyst for personal growth and community empowerment. The club's mission is to create a space for 'Ideas worth spreading — Knowledge worth sharing', where ideas are celebrated, knowledge is shared, and consistency unlocks flexible thinking.",
    "pill": "MISSION 01 · CONSISTENCY IS FLEXIBILITY"
  },
  {
    "index": "02",
    "titleEn": "Professional Event Organizing Excellence",
    "titleVi": "Professional Event Organizing Excellence",
    "descriptionVi": "Organizing meticulous, engaging, educational, and inspiring events that reach far beyond university campus grounds.",
    "detailVi": "Skillcetera takes pride in professional event organizing capabilities that have established a reputation beyond FPT University. Every initiative is thoroughly invested from academic quality and stage directing to attendee experience.",
    "pill": "MISSION 02 · EVENT ORGANIZING EXCELLENCE"
  },
  {
    "index": "03",
    "titleEn": "An Open and Inclusive Environment",
    "titleVi": "An Open and Inclusive Environment",
    "descriptionVi": "An environment that respects diversity, encourages open dialogue, and stands together so that every member is heard and empowered.",
    "detailVi": "We value diversity, mutual respect, and open communication. The club welcomes every individual with their unique personality, perspectives, and ideas, cultivating an empathetic culture of mutual support.",
    "pill": "MISSION 03 · OPEN & INCLUSIVE ENVIRONMENT"
  }
];
export const ANNUAL_EVENTS = {
  "esc": {
    "id": "esc",
    "name": "ESC",
    "fullName": "English Speaking Competition",
    "accent": "blue",
    "status": "past",
    "latestObservedEdition": "ESC 2025 / BREAK THE NORM",
    "headline": "Your voice. Your impact.",
    "description": "An academic arena for university and college students nationwide to confidently express critical thinking, stage presence, and personal voice in English.",
    "detailOverview": "English Speaking Competition (ESC) is an annual speech and debate tournament hosted by Skillcetera, bringing together contestants from over 20 universities and colleges. The competition inspires youth to 'Break The Norm' and use language as a catalyst to amplify independent perspectives and solutions for social challenges.",
    "rounds": [
      {
        "round": "Round 01 · Preliminary Round",
        "title": "Shaping Personal Voice",
        "desc": "Contestants submit video and written entries presenting independent viewpoints on the season's open academic theme."
      },
      {
        "round": "Round 02 · Semi-Final Round",
        "title": "Direct Dialogue & Debate",
        "desc": "Contestants deliver on-stage keynote speeches and engage in live defense with the academic judging panel."
      },
      {
        "round": "Round 03 · Grand Final Show",
        "title": "Break The Norm Final Showdown",
        "desc": "Top finalists compete through keynote speeches and 1v1 debate showdowns on the grand stage before hundreds of attendees."
      }
    ],
    "image": "/assets/esc.webp",
    "originalImage": "/assets/esc.png",
    "imageAlt": "Skillcetera English Speaking Competition Grand Final Show documentation",
    "metrics": [
      {
        "value": "200+",
        "num": 200,
        "dec": 0,
        "suf": "+",
        "label": "Contestants",
        "period": "Per club archive (Oct 24, 2026)"
      },
      {
        "value": "20+",
        "num": 20,
        "dec": 0,
        "suf": "+",
        "label": "Universities & Colleges",
        "period": "Per club archive (Oct 24, 2026)"
      },
      {
        "value": "50+ Million",
        "num": 50,
        "dec": 0,
        "suf": "+ Million",
        "label": "Total Prize Pool (VND)",
        "period": "Per club archive (Oct 24, 2026)"
      }
    ],
    "cta": {
      "label": "View on Facebook",
      "url": "https://www.facebook.com/share/p/1Frf2ebFwQ/",
      "externalLabel": "ESC Documentary Post on Facebook",
      "externalUrl": "https://www.facebook.com/share/p/1Frf2ebFwQ/"
    },
    "sourceNote": "Official academic competition scale documented across seasons in Skillcetera club archives.",
    "pill": "ANNUAL EVENT 01 · ENGLISH SPEAKING COMPETITION",
    "title": "Your voice.<br><em>Your impact.</em>",
    "logoTag": "ENGLISH · CRITICAL THINKING · CONVICTION",
    "editionMilestone": {
      "label": "Latest Edition Milestone",
      "edition": "ESC 2025",
      "theme": "BREAK THE NORM"
    }
  },
  "tedx": {
    "id": "tedx",
    "name": "TEDxFPTUniversityHCMC",
    "accent": "red",
    "status": "past",
    "headline": "Ideas worth spreading.",
    "description": "Stories that spark fresh perspectives. Skillcetera serves as the primary organizing unit of TEDxFPTUniversityHCMC across seasons from 2021 to 2025.",
    "detailOverview": "As the primary organizing licensee for TEDxFPTUniversityHCMC, Skillcetera creates a gathering place where multidisciplinary speakers and university students meet through ideas worth spreading. Club archives record 5 consecutive seasons from 2021 to 2025.",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "imageLabel": "SEASON 2024 ARCHIVE / START SMALL (SEASON 04)",
    "imageAlt": "TEDxFPTUniversityHCMC Season 04 START SMALL Documentation",
    "metrics": [
      {
        "value": "100+",
        "num": 100,
        "dec": 0,
        "suf": "+",
        "label": "Tickets Sold Per Season",
        "period": "Each season (per archive)"
      },
      {
        "value": "2.5M+",
        "num": 2.5,
        "dec": 1,
        "suf": "M+",
        "label": "YouTube Channel Views",
        "period": "Per club archive"
      },
      {
        "value": "19",
        "num": 19,
        "dec": 0,
        "suf": "",
        "label": "Featured Speakers",
        "period": "Per club archive"
      },
      {
        "value": "50+",
        "num": 50,
        "dec": 0,
        "suf": "+",
        "label": "Sponsoring Partners",
        "period": "Per club archive"
      }
    ],
    "socialMetrics": [
      {
        "platform": "TikTok TEDx",
        "value": "55K+ Followers"
      },
      {
        "platform": "Facebook TEDx",
        "value": "14K+ Followers"
      },
      {
        "platform": "Instagram TEDx",
        "value": "3.5K+ Followers"
      }
    ],
    "cta": {
      "label": "View on Facebook",
      "url": "https://www.facebook.com/tedxfptuniversityhcmc",
      "externalLabel": "TEDxFPTUniversityHCMC on Facebook",
      "externalUrl": "https://www.facebook.com/tedxfptuniversityhcmc"
    },
    "sourceNote": "Event and media metrics are specific to TEDxFPTUniversityHCMC in club records (retrieved Oct 24, 2026). Source text notes 'four seasons' while cataloging 5 full seasons from 2021 to 2025.",
    "imagePosition": "51% 62%",
    "imageFit": "cover",
    "pill": "ANNUAL EVENT 02 · TEDxFPTUniversityHCMC",
    "title": "Ideas worth<br><em>spreading.</em>",
    "logoTag": "TIKTOK 55K+ · FACEBOOK 14K+ · IG 3.5K+"
  }
};
export const TEDX_SEASONS = {
  "2021": {
    "year": "2021",
    "theme": "EXTRAORDINARY STEPS",
    "editionLabel": "Season 2021 · Beginning the Journey",
    "description": "The debut edition in Skillcetera's TEDxFPTUniversityHCMC catalog, laying the first milestone for ideas worth spreading at FPT University HCMC.",
    "statusNote": "Historical club archive (2021).",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "metrics": [
      {
        "label": "Tickets Issued",
        "value": "100+"
      },
      {
        "label": "YouTube Views",
        "value": "200K+"
      },
      {
        "label": "Featured Speakers",
        "value": "10"
      },
      {
        "label": "Sponsoring Partners",
        "value": "20+"
      }
    ]
  },
  "2022": {
    "year": "2022",
    "theme": "VALUE TRANSITION",
    "editionLabel": "Season 2022 · Value Transition",
    "description": "Conversations on evolving perspectives, personal core values, and how young generations adapt to emerging societal shifts.",
    "statusNote": "Historical club archive (2022).",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "metrics": [
      {
        "label": "Tickets Issued",
        "value": "100+"
      },
      {
        "label": "YouTube Views",
        "value": "350K+"
      },
      {
        "label": "Featured Speakers",
        "value": "12"
      },
      {
        "label": "Sponsoring Partners",
        "value": "25+"
      }
    ]
  },
  "2023": {
    "year": "2023",
    "theme": "WITH OR WITHOUT",
    "editionLabel": "Season 2023 · Choice & Conviction",
    "description": "Exploring boundaries between having and letting go, holding on and moving forward to define one's authentic path.",
    "statusNote": "Historical club archive (2023).",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "metrics": [
      {
        "label": "Tickets Issued",
        "value": "100+"
      },
      {
        "label": "YouTube Views",
        "value": "500K+"
      },
      {
        "label": "Featured Speakers",
        "value": "14"
      },
      {
        "label": "Sponsoring Partners",
        "value": "35+"
      }
    ]
  },
  "2024": {
    "year": "2024",
    "theme": "START SMALL",
    "editionLabel": "Season 2024 · Big Things Start Small (Season 04)",
    "description": "Every monumental shift begins with small, persistent steps — the edition spotlighting Season 04: Big Things Start Small.",
    "statusNote": "Historical archive with Season 04 visual identity (2024).",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "metrics": [
      {
        "label": "Tickets Issued",
        "value": "100+"
      },
      {
        "label": "YouTube Views",
        "value": "750K+"
      },
      {
        "label": "Featured Speakers",
        "value": "16"
      },
      {
        "label": "Sponsoring Partners",
        "value": "40+"
      }
    ]
  },
  "2025": {
    "year": "2025",
    "theme": "ALL THE WAY",
    "editionLabel": "Season 2025 · All The Way",
    "description": "Theme of TEDxFPTUniversityHCMC 2025 in Skillcetera's catalog, championing the courage to pursue ideas to the very end.",
    "statusNote": "Latest recorded season in club archives; next season announcement pending.",
    "image": "/assets/tedx.webp",
    "originalImage": "/assets/tedx.jpg",
    "metrics": [
      {
        "label": "Tickets Sold Per Season",
        "value": "100+"
      },
      {
        "label": "YouTube Views",
        "value": "2.5M+"
      },
      {
        "label": "Featured Speakers",
        "value": "19"
      },
      {
        "label": "Sponsoring Partners",
        "value": "50+"
      }
    ]
  }
};
export const ESC_SEASONS = {
  "2023": {
    "year": "2023",
    "theme": "THE NEXT CHAPTER",
    "editionLabel": "Season 2023 · Finding Your Voice",
    "description": "Established the benchmark 3-round academic competition framework and student public speaking excellence.",
    "statusNote": "Archival records for the 2023 season.",
    "image": "/assets/esc.webp",
    "originalImage": "/assets/esc.png",
    "metrics": [
      {
        "label": "Contestants",
        "value": "150+"
      },
      {
        "label": "Universities & Colleges",
        "value": "15+"
      },
      {
        "label": "Total Prize Pool",
        "value": "35+ Million"
      },
      {
        "label": "Milestone",
        "value": "Campus Finals"
      }
    ]
  },
  "2024": {
    "year": "2024",
    "theme": "VOICE OF TOMORROW",
    "editionLabel": "Season 2024 · Voice of Tomorrow",
    "description": "Marked an expansive scale of inter-university collaboration across partner institutions nationwide.",
    "statusNote": "Archival records for the 2024 season.",
    "image": "/assets/esc.webp",
    "originalImage": "/assets/esc.png",
    "metrics": [
      {
        "label": "Contestants",
        "value": "180+"
      },
      {
        "label": "Universities & Colleges",
        "value": "18+"
      },
      {
        "label": "Total Prize Pool",
        "value": "40+ Million"
      },
      {
        "label": "Milestone",
        "value": "Southern Regional Final"
      }
    ]
  },
  "2025": {
    "year": "2025",
    "theme": "BREAK THE NORM",
    "editionLabel": "Season 2025 · Break The Norm (Grand Final)",
    "description": "An academic arena bringing together top talents from 20+ universities, asserting bold critical thinking and fluent English debate.",
    "statusNote": "Latest recorded season in club archives; next season announcement pending.",
    "image": "/assets/esc.webp",
    "originalImage": "/assets/esc.png",
    "metrics": [
      {
        "label": "Contestants",
        "value": "200+"
      },
      {
        "label": "Universities & Colleges",
        "value": "20+"
      },
      {
        "label": "Total Prize Pool",
        "value": "50+ Million"
      },
      {
        "label": "Milestone",
        "value": "BREAK THE NORM"
      }
    ]
  }
};
export const OTHER_PROJECTS = {
  "discussion": {
    "id": "discussion",
    "number": "01",
    "title": "Discussion Forum",
    "category": "ACADEMIC FORUM",
    "description": "An open academic dialogue space between members and invited guests on diverse topics, where every viewpoint is heard and challenged constructively.",
    "detailText": "Discussion Forum is Skillcetera's regular thematic panel series, connecting club members with experienced speakers, lecturers, and industry guests (covering Education, Employment, critical thinking, and career skills). It is the cradle for active listening and sharp reasoning.",
    "metricsLabel": "Academic Forum · Periodic dialogues with members & guests",
    "image": "/assets/discussion-forum.webp",
    "originalImage": "/assets/discussion-forum.png",
    "alt": "Skillcetera Discussion Forum activities documentation",
    "linkUrl": "/projects#discussion",
    "externalUrl": "https://www.facebook.com/skillcetera",
    "linkLabel": "Discussion Forum Details →"
  },
  "scavenger": {
    "id": "scavenger",
    "number": "02",
    "title": "Scavenger Hunt",
    "category": "CULTURAL & HISTORICAL EXPEDITION",
    "description": "An urban exploration race across Saigon's culture, history, and geography through hands-on challenges requiring strong teamwork.",
    "detailText": "Scavenger Hunt takes participants out onto the streets of Saigon to decipher cryptic clues and challenges tied to the city's heritage and culture. Across 6 seasons, it blends physical teamwork with deep local discovery.",
    "metricsLabel": "6 seasons organized · 50+ participants per season · 10+ locations across Saigon",
    "image": "/assets/scavenger-hunt.webp",
    "originalImage": "/assets/scavenger-hunt.png",
    "alt": "Skillcetera Scavenger Hunt journey documentation",
    "linkUrl": "/projects#scavenger",
    "externalUrl": "https://www.facebook.com/share/p/1a3u4uWu7i/",
    "linkLabel": "Scavenger Hunt Details →"
  },
  "retreat": {
    "id": "retreat",
    "number": "03",
    "title": "Meditation Retreat",
    "category": "MINDFULNESS & PERSONAL GROWTH",
    "description": "A mindful retreat into nature to practice meditation, self-reflect, and nurture inner balance.",
    "detailText": "Amid vibrant study and event schedules, Meditation Retreat offers a serene pause for members and attendees to reconnect with nature, practice mindfulness, listen within, and share openly. Club records document 3 meaningful seasons.",
    "metricsLabel": "3 recorded seasons · Nature immersion & personal growth",
    "image": "/assets/meditation-retreat.webp",
    "originalImage": "/assets/meditation-retreat.jpg",
    "alt": "Skillcetera Meditation Retreat activities documentation",
    "linkUrl": "/projects#retreat",
    "externalUrl": "https://www.facebook.com/share/p/19dbTpTqzZ/",
    "linkLabel": "Meditation Retreat Details →"
  },
  "store": {
    "id": "store",
    "number": "04",
    "title": "S-Store",
    "category": "CREATIVE MERCHANDISE & FUNDRAISING",
    "description": "Fundraising merchandise conceived and designed by Skillcetera members: t-shirts, lanyards, tote bags, and badges.",
    "detailText": "S-Store is Skillcetera's official merchandise project where members conceptualize, design, and produce branded apparel and accessories (including collaborative drops with Coolmate). Over 500 lanyards, 100+ t-shirts, and 100+ tote bags sold.",
    "metricsLabel": "Sold: 500+ lanyards · 100+ t-shirts · 100+ tote bags (per source archive)",
    "image": "/assets/s-store.webp",
    "originalImage": "/assets/s-store.jpg",
    "alt": "Skillcetera S-Store merchandise documentation",
    "linkUrl": "/projects#store",
    "externalUrl": "https://www.facebook.com/SkillceteraStore",
    "linkLabel": "S-Store Details →"
  },
  "moneyverse": {
    "id": "moneyverse",
    "number": "05",
    "title": "The MoneyVerse",
    "category": "CAMPUS RELATIONS & MEDIA PARTNERSHIP",
    "description": "Partnering in financial literacy and investment education for youth produced by VTV Times as campus relations and student ambassador partners.",
    "detailText": "The MoneyVerse is a financial and investment education series combining entertainment and technology for youth, produced by VTV Times (Vietnam Television). Skillcetera collaborated in campus relations, student ambassador coordination, and club networking across 10 southern university campuses.",
    "metricsLabel": "Partnership scope: 10 Southern university campuses (VTV Times)",
    "image": "/assets/moneyverse.webp",
    "originalImage": "/assets/moneyverse.png",
    "alt": "Skillcetera The MoneyVerse partnership documentation",
    "linkUrl": "/projects#moneyverse",
    "externalUrl": "https://www.facebook.com/skillcetera",
    "linkLabel": "The MoneyVerse Details →"
  }
};
export const HQ_GALLERY = [
  {
    "id": "hq-1792899496622",
    "title": "Skillcetera Event Photography",
    "alt": "Skillcetera documentary photo",
    "caption": "1920 × 1280 px · Original High Resolution",
    "webpUrl": "/assets/553654839_1312594657543274_6065555061644359671_n-mvna2gge.webp",
    "originalUrl": "/assets/originals/553654839_1312594657543274_6065555061644359671_n-mvna2gge.jpg",
    "dimensions": "1920 × 1280 px"
  },
  {
    "id": "hq-615707596_1406518118150927_8099910856454498230_n-mvmf0nkw",
    "title": "Skillcetera Community Gathering",
    "alt": "Skillcetera archival photo",
    "caption": "2048 × 1282 px · Saved on server",
    "webpUrl": "/assets/615707596_1406518118150927_8099910856454498230_n-mvmf0nkw.webp",
    "originalUrl": "/assets/originals/615707596_1406518118150927_8099910856454498230_n-mvmf0nkw.jpg",
    "dimensions": "2048 × 1282 px"
  }
];

export const FULL_CONTENT = {
  siteMeta: SITE_META,
  missions: MISSIONS,
  annualEvents: ANNUAL_EVENTS,
  tedxSeasons: TEDX_SEASONS,
  escSeasons: ESC_SEASONS,
  otherProjects: OTHER_PROJECTS,
  hqGallery: HQ_GALLERY,
};
