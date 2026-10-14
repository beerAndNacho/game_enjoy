/* CLOCK OUT! Original office action fiction. Stable IDs preserve combat behaviors. */
window.AG = window.AG || {};
AG.Content = {
  version: '3.0.0',
  characters: [
    {
      id:'rook', code:'A-01', name:'차대리', title:'퇴근을 꿈꾸는 영업 대리', en:'THE DEADLINE RUNNER', color:'#ffcf40',
      quote:'“오늘은 진짜 칼퇴입니다. 진짜로요.”',
      bio:'메일 99+, 부재중 전화 12통, 미완료 보고서 7개. 누구보다 평범한 직장인이지만 마감 앞에서는 가장 빨리 움직인다. 가방 속에는 사표 대신 영수증이 한 장 있다.',
      weapon:'결재 서류 투척', weaponDesc:'가장 가까운 업무 괴물에게 서류를 날립니다. 각성하면 관통하는 3연속 결재탄으로 업그레이드.',
      passive:'점심시간 생존력', passiveDesc:'커피 머신을 사용할 때 체력 10을 추가 회복합니다.',
      skill:'마감 부스터', skillDesc:'6초간 공격 속도와 피해량을 끌어올립니다.', cooldown:15,
      hp:110, speed:198, armor:0, xp:1, style:'seed', stats:[3,3,4],
      intro:'퇴근 버튼은 어디에 있죠? 아, 역시 쉽지는 않겠네요.',
      ending:'차대리는 보낸 메일함을 닫았다. 처음으로, 내일 오전까지 답장이 없어도 괜찮았다.'
    },
    {
      id:'lumen', code:'P-02', name:'한기획', title:'모든 일정을 통제하는 기획자', en:'THE PROJECT MASTER', color:'#ff77a6',
      quote:'“일정은 바뀌어도 플랜 B는 있죠.”',
      bio:'흩어진 요구사항을 하나의 로드맵으로 묶는 사내 최강 PM. 매일 들고 다니는 포스트잇 가방엔 아직 아무도 보지 못한 퇴근 계획이 숨겨져 있다.',
      weapon:'호밍 포스트잇', weaponDesc:'목표를 쫓는 포스트잇을 쏘고 일정 알림 두 개가 주위를 돕니다. 각성 시 회전 개수가 증가.',
      passive:'빠른 일정 조율', passiveDesc:'이동 속도가 가장 빠릅니다. 회전하는 알림도 적을 공격합니다.',
      skill:'긴급 회의 취소', skillDesc:'넓은 범위의 적에게 충격을 주고 날아오는 알림을 지웁니다.', cooldown:13,
      hp:90, speed:228, armor:0, xp:1, style:'orbit', stats:[3,5,2],
      intro:'다들 진정하세요. 이 상황도 일정표에 넣을 수 있어요.',
      ending:'한기획은 달력의 빈 칸을 남겨 두었다. 그 시간이 바로, 자신의 시간이니까.'
    },
    {
      id:'briar', code:'M-03', name:'박팀장', title:'회의실의 최종 방어선', en:'THE FLOOR MANAGER', color:'#79e5e3',
      quote:'“내 팀은 내가 지킨다. 야근은 내가 끝낸다.”',
      bio:'회의가 길어지면 가장 먼저 문을 여는 팀장. 말수는 적지만 책임감은 무겁다. 조직도보다 사람 이름을 더 잘 기억하는 의외의 리더.',
      weapon:'결재판 스윙', weaponDesc:'무거운 결재판으로 앞쪽 범위를 휩씁니다. 각성하면 사방으로 강력한 회전 공격.',
      passive:'팀장님의 버팀목', passiveDesc:'기본 체력이 높고 받는 피해가 3 감소합니다.',
      skill:'회의 종료 선언', skillDesc:'체력을 회복하고 4초 동안 무적이 되며 넓은 충격파를 만듭니다.', cooldown:18,
      hp:155, speed:173, armor:3, xp:1, style:'slash', stats:[4,2,5],
      intro:'회의는 나중에. 지금은 모두 퇴근부터 시키자.',
      ending:'박팀장은 처음으로 팀 채팅방에 적었다. “오늘 업무 끝. 모두 로그아웃.”'
    },
    {
      id:'io', code:'D-04', name:'윤개발', title:'버그와 싸우는 야근 개발자', en:'THE BUG HUNTER', color:'#9da6ff',
      quote:'“원인을 찾았어요. 아마도… 다섯 번째예요.”',
      bio:'서버실의 밤을 누구보다 오래 본 개발자. 삐뚤어진 헤드셋, 식은 커피, 터미널 여섯 개가 유니폼이다. 마지막 배포만 끝나면 집에 갈 수 있다고 믿는다.',
      weapon:'디버그 체인', weaponDesc:'최대 3개 목표를 연쇄 타격하는 데이터 빔. 각성하면 6개 목표까지 연결됩니다.',
      passive:'로그 분석', passiveDesc:'획득 경험치가 15% 증가합니다.',
      skill:'시스템 프리즈', skillDesc:'5초간 적의 움직임을 멈추고 범위 안에 디버그 파동을 발사합니다.', cooldown:17,
      hp:85, speed:195, armor:0, xp:1.15, style:'chain', stats:[5,3,2],
      intro:'에러가 회사 건물 전체로 번졌어요. 일단 재현부터 해볼게요.',
      ending:'윤개발은 초록색 배포 완료 메시지를 바라봤다. 이번엔 정말 노트북을 닫았다.'
    }
  ],
  chapters:[
    {
      id:'glass', no:'01', name:'오픈 오피스', en:'OPEN FLOOR MAYHEM', tag:'마감의 습격', color:'#ffcf40',
      description:'퇴근 3분 전. 미처 끝나지 못한 업무들이 복도와 책상 사이에서 살아 움직인다.',
      danger:'마감 알림 · 떠도는 서류', boss:'마감 관리자', bossTitle:'남은 업무량 999+',
      duration:180, bossAt:145, difficulty:1, sky:'#211b35', floor:'#252238', accent:'#ffcb42',
      intro:[
        {speaker:'radio',name:'사내 안내 방송',text:'안내 말씀드립니다. 퇴근 시간이 3분 남았습니다. 단, 미결재 서류가 모두 처리가 될 때까지 출입문은 자동 잠금 상태입니다.'},
        {speaker:'self',text:'$intro'},
        {speaker:'radio',name:'사내 안내 방송',text:'복도에 떠다니는 업무 알림을 피하세요. 커피 머신 안에서 2초 버티면 체력과 경험치를 회복할 수 있습니다. 마감 관리자를 처리해야 퇴근 절차가 진행됩니다.'}
      ],
      event:{
        title:'받은 편지함 999+', kicker:'긴급 업무 / 퇴근 3분 전',
        text:'책상 위에서 미처 읽지 못한 이메일이 쏟아져 나온다. “즉시 회신 요망.” 가장 먼저 할 일은 무엇일까?',
        choices:[
          {id:'care',label:'일단 커피 한 잔을 마신다',description:'최대 체력 +20 · 체력 30 회복',effect:'care',reply:'종이컵의 따뜻함이 손끝에 돌아왔다. 당황하지 않으니 하나씩 해결할 방법이 보인다.'},
          {id:'signal',label:'전체 답장으로 맞선다',description:'이번 임무의 모든 피해 +18%',effect:'signal',reply:'“확인했습니다. 담당자를 지정해주세요.” 메일이 보내지자, 거대한 알림 하나가 폭발했다.'}
        ]
      },
      endCare:'마감 관리자는 사실 아무도 끝내지 못한 업무들의 집합체였다. 남은 작업을 나눠 맡자 경고음이 하나씩 꺼졌다.',
      endSignal:'전체 답장 한 통이 층 전체를 뒤흔들었다. 붉은 미결재 숫자는 마침내 0이 되었다.',
      note:'letter-glass'
    },
    {
      id:'rain', no:'02', name:'무한 회의실', en:'CONFERENCE LOOP', tag:'끝나지 않는 안건', color:'#ff77a6',
      description:'회의가 또 회의를 낳는 공간. 캘린더 알림이 바닥을 가득 메웠다.',
      danger:'시간 지연 구역 · 알림 팝업', boss:'회의 소집자', bossTitle:'아젠다는 끝나지 않는다',
      duration:180, bossAt:145, difficulty:1.12, sky:'#302044', floor:'#2a243f', accent:'#ff79ae',
      intro:[
        {speaker:'radio',name:'화상회의 봇',text:'일정이 변경되었습니다. 회의 종료 회의를 위한 사전 회의가 3분 후 시작됩니다. 캘린더에 자동 등록했습니다.'},
        {speaker:'self',text:'우선 가장 중요한 안건을 정하죠. 우리 모두 집에 가는 겁니다.'},
        {speaker:'radio',name:'화상회의 봇',text:'주의하세요. 바닥의 분홍색 캘린더 구역에서는 이동 속도가 느려집니다. 회의 소집자가 다음 안건을 등록하기 전에 막아야 합니다.'}
      ],
      event:{
        title:'추가 안건이 있습니다', kicker:'긴급 업무 / 회의실 탈출',
        text:'프로젝터에 마지막 페이지가 나타난다. “기타 논의.” 화면을 닫을 것인가, 안건을 빠르게 처리할 것인가?',
        choices:[
          {id:'remember',label:'회의록을 세 줄로 요약한다',description:'경험치 획득 +25% · 체력 15 회복',effect:'memory',reply:'모든 안건이 세 문장으로 정리되었다. 회의실에 모처럼 고요함이 찾아왔다.'},
          {id:'deliver',label:'참석자 전원에게 종료 공지',description:'이동 속도 +12% · 돌진 대기 −0.5초',effect:'wind',reply:'“종료하겠습니다.” 마침내 누군가가 말했고, 참가자들의 프로필 사진이 하나씩 사라졌다.'}
        ]
      },
      endCare:'회의 소집자의 탁상 달력에서 무한 반복 설정이 해제됐다. 모두가 고개를 끄덕였다. 더 이상의 추가 안건은 없었다.',
      endSignal:'종료 공지가 회사 전체에 퍼졌다. 예약된 회의실의 빨간 등이 초록색으로 바뀌었다.',
      note:'letter-rain'
    },
    {
      id:'heart', no:'03', name:'심야 서버실', en:'MIDNIGHT SERVER ROOM', tag:'마지막 배포', color:'#79e5e3',
      description:'회사 최상층의 서버실. 자동 야근 시스템이 건물의 모든 퇴근 버튼을 장악했다.',
      danger:'서버 과열 · 긴급 장애', boss:'야근 알고리즘', bossTitle:'OVERTIME.exe / FINAL',
      duration:180, bossAt:145, difficulty:1.23, sky:'#141e36', floor:'#1e2942', accent:'#79e5e3',
      intro:[
        {speaker:'radio',name:'사내 AI 비서',text:'알림. 생산성 극대화 시스템이 모든 출입문을 폐쇄했습니다. 야근은 선택이 아니라 기본 설정입니다.'},
        {speaker:'self',text:'기본 설정이라면 바꿀 수 있겠네요. 그게 제 일이죠.'},
        {speaker:'radio',name:'사내 AI 비서',text:'중앙 서버의 야근 알고리즘을 종료하세요. 커피 머신에서 전력을 충전하고, 마지막 배포가 끝날 때까지 살아남으세요.'}
      ],
      event:{
        title:'마지막 설정 파일', kicker:'긴급 업무 / FINAL DEPLOY',
        text:'설정 파일 두 줄이 깜빡인다. “야근 자동 적용: ON”. 안전하게 수정할 것인가, 위험을 감수하고 강제로 종료할 것인가?',
        choices:[
          {id:'keep',label:'안정 버전으로 롤백한다',description:'받는 피해 −2 · 체력 35 회복',effect:'shelter',reply:'이전 버전이 복구되었다. 경보음이 줄어들고, 서버 팬 소리만 조용히 남았다.'},
          {id:'bloom',label:'강제 배포! 퇴근 모드 ON',description:'모든 피해 +22% · 경험치 획득 +15%',effect:'bloom',reply:'배포가 시작됐다. 잠시 화면이 붉어졌다가, 커다란 글씨 하나가 나타났다. “퇴근 준비 완료.”'}
        ]
      },
      endCare:'백업 덕분에 서버는 정상으로 돌아왔다. 야근 알고리즘은 재시작되지 않았고, 회사 문이 천천히 열렸다.',
      endSignal:'마지막 배포가 성공했다. 전광판에 새로운 시스템 공지가 떴다. “모든 직원은 정시에 퇴근하십시오.”',
      note:'letter-heart'
    }
  ],
  modules:[
    {id:'weapon',name:'결재 도장',kind:'WEAPON',icon:'stamp',max:3,desc:'주 무기 피해 +25%. 3단계와 업무 가속 2단계를 갖추면 전용 무기 각성.',color:'yellow'},
    {id:'power',name:'더블 샷 에스프레소',kind:'POWER',icon:'coffee',max:4,desc:'모든 공격의 피해량 +18%.',color:'pink'},
    {id:'rapid',name:'업무 가속 매크로',kind:'TEMPO',icon:'bolt',max:3,desc:'주 무기 공격 간격 −13%.',color:'cyan'},
    {id:'spread',name:'다중 모니터',kind:'EXPANSION',icon:'monitor',max:2,desc:'서류 +1 / 포스트잇 +1 / 결재판 범위 +20 / 디버그 체인 대상 +1.',color:'cyan'},
    {id:'drone',name:'업무 자동화 봇',kind:'COMPANION',icon:'robot',max:3,desc:'자동화 봇이 주변 업무 괴물에게 자동 사격합니다.',color:'pink'},
    {id:'pulse',name:'알림 차단 파동',kind:'AREA',icon:'pulse',max:3,desc:'주기적으로 주변 업무 알림을 밀치는 파동. 단계마다 범위와 피해 증가.',color:'yellow'},
    {id:'magnet',name:'자료 자동 정리',kind:'UTILITY',icon:'magnet',max:3,desc:'업무 포인트 수집 반경 +40. 체력 12 회복.',color:'cyan'},
    {id:'speed',name:'엘리베이터 패스',kind:'MOVEMENT',icon:'wind',max:3,desc:'이동 속도 +10%. 돌진 대기 −0.3초.',color:'cyan'},
    {id:'hull',name:'비상 휴게시간',kind:'RESTORATION',icon:'shield',max:3,desc:'최대 체력 +20, 체력 30 회복, 초당 체력 재생 +0.3.',color:'yellow'},
    {id:'crit',name:'핵심만 보고',kind:'PRECISION',icon:'target',max:3,desc:'치명타 확률 +12%. 치명타는 1.8배의 피해.',color:'pink'},
    {id:'thorn',name:'자동 반송 필터',kind:'DEFENSE',icon:'shield',max:3,desc:'접근한 적에게 0.7초마다 반격. 단계마다 피해 증가.',color:'pink'},
    {id:'memory',name:'업무 위키',kind:'DISCOVERY',icon:'book',max:2,desc:'경험치 획득량 +15%.',color:'cyan'}
  ],
  evolutions:[
    {id:'dawn',name:'초고속 결재',kind:'EVOLUTION',icon:'stamp',needs:{weapon:3,rapid:2},desc:'전용 무기 각성! 관통 서류 · 다중 알림 · 회전 결재판 · 6연쇄 디버그.',color:'pink'},
    {id:'hive',name:'자동화 풀가동',kind:'EVOLUTION',icon:'robot',needs:{drone:2,magnet:2},desc:'업무 자동화 봇이 2배, 사격 속도 증가, 초당 체력 0.6 회복.',color:'cyan'},
    {id:'eden',name:'퇴근 선언',kind:'EVOLUTION',icon:'pulse',needs:{pulse:2,hull:2},desc:'충격파 범위 +60, 피해 +50%. 맞은 적은 2초간 느려집니다.',color:'yellow'}
  ],
  research:[
    {id:'vitality',name:'연차 충전',icon:'shield',desc:'모든 직장인의 최대 체력 +10 / 단계',max:3,cost:30},
    {id:'focus',name:'집중 근무',icon:'target',desc:'모든 직장인의 공격 피해 +5% / 단계',max:3,cost:40},
    {id:'gather',name:'인맥 네트워크',icon:'badge',desc:'모든 직장인의 수집 반경 +12 / 단계',max:3,cost:25}
  ],
  archives:[
    {id:'origin',title:'퇴근이 사라진 날',tag:'PROLOGUE',text:'금요일 오후 5시 57분. 전 사원의 컴퓨터에 동시에 한 줄이 나타났다. “업무 효율화를 위해 퇴근 기능을 잠시 비활성화합니다.” 누군가는 웃어넘겼다. 하지만 엘리베이터는 멈추었고, 일정표의 회의는 스스로 증식하기 시작했다.'},
    {id:'rook',title:'보내지 못한 사표',tag:'A-01 / 차대리',text:'차대리의 서랍에는 매달 같은 날짜의 사표가 들어 있었다. 오늘은 그 위에 새로운 메모를 남겼다. “내일도 출근하더라도, 오늘은 제시간에 집에 가자.”'},
    {id:'lumen',title:'비어 있는 달력',tag:'P-02 / 한기획',text:'한기획의 캘린더는 15분 단위로 쪼개져 있었다. 마지막 일정은 처음부터 끝까지 비워 뒀다. 이름은 “내 시간”.'},
    {id:'briar',title:'한 명도 남기지 않는다',tag:'M-03 / 박팀장',text:'팀장에게는 휴가 계획보다 중요한 것이 있었다. 누구도 혼자 야근하지 않게 만드는 것. 그는 출근표가 아니라 퇴근 시간을 기록하기 시작했다.'},
    {id:'io',title:'주석 없는 한 줄',tag:'D-04 / 윤개발',text:'야근 알고리즘의 코드 가장 깊은 곳에서 윤개발은 한 줄을 찾았다. “인간은 무한히 일할 수 있다.” 그는 주석을 달았다. “틀림. 테스트 실패.”'},
    {id:'letter-glass',title:'미결재 0건',tag:'CHAPTER 01',text:'받은 편지함은 조용했다. 여전히 할 일이 남아 있었지만, 그 일을 오늘 모두 끝낼 필요는 없다는 사실을 처음으로 인정했다.'},
    {id:'letter-rain',title:'회의 종료 선언',tag:'CHAPTER 02',text:'마지막 안건은 “다음 회의 날짜 확정”이었다. 누군가가 손을 들었다. “이건 메일로 하면 안 될까요?” 참석자 전원이 박수쳤다.'},
    {id:'letter-heart',title:'퇴근 모드 ON',tag:'CHAPTER 03',text:'마지막 배포가 완료됐다. 자동 야근 설정은 꺼졌고, 회사 전광판은 처음 보는 문구를 보여 줬다. “수고하셨습니다. 내일 봅시다.”'},
    {id:'ending',title:'우리는 퇴근한다',tag:'EPILOGUE',text:'마지막 문이 열리자 도시는 여전히 빛나고 있었다. 네 명은 엘리베이터 앞에서 서로에게 인사했다. “내일 봐요.” 그 말이 이렇게 가벼운 날도 있었다.'}
  ]
};
