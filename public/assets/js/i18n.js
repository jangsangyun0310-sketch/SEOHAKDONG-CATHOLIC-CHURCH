// 외국인 방문객(주로 관광객)용 다국어 보기 (한국어 / English / 日本語 / 中文)
// 관광객이 주로 보는 미사시간·본당 소개·오시는 길 같은 고정 문구만 아래 사전(D)의 직접 번역으로 바꾼다.
// 공지·주보·갤러리·알림처럼 관리자가 올리는 내용은 번역하지 않고 한국어로 둔다.
// 어떤 언어로 볼지는 index.html <head>의 짧은 스크립트가 먼저 정해 window.__LANG에 넣어둔다.
(function () {
  const LANGS = ['ko', 'en', 'ja', 'zh'];
  const LANG_KEY = 'seohakdong-lang';
  const lang = LANGS.includes(window.__LANG) ? window.__LANG : 'ko';
  const IDX = { en: 0, ja: 1, zh: 2 }[lang];
  const LOCALE = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' }[lang];

  // [English, 日本語, 中文(简体)]
  const D = {
    page_title: ['Seohakdong Catholic Church | Diocese of Jeonju', '西鶴洞聖堂 | カトリック全州教区', '西鹤洞天主堂 | 天主教全州教区'],

    // 외국어 화면에만 보이는 안내
    korean_only_note: [
      'Notices, bulletins and photos are posted in Korean only.',
      'お知らせ・週報・写真は韓国語のみで掲載しています。',
      '公告、周报和照片仅以韩语发布。',
    ],
    mass_change_note: [
      'Mass times may change. Please call the parish office (<span class="nowrap">+82-63-286-4929</span>) to confirm.',
      'ミサの時間は変更になる場合があります。事務室（<span class="nowrap">+82-63-286-4929</span>）にお電話でご確認ください。',
      '弥撒时间可能会有变动，请致电堂区办公室（<span class="nowrap">+82-63-286-4929</span>）确认。',
    ],

    // 헤더
    brand_reload: ['Reload the homepage', 'ホームページを再読み込み', '刷新首页'],
    nav_intro: ['About', '聖堂紹介', '堂区介绍'],
    nav_notice: ['Notices & Bulletins', 'お知らせ・週報', '公告·周报'],
    nav_gallery: ['Gallery', 'ギャラリー', '相册'],
    nav_location: ['Directions', 'アクセス', '交通指南'],
    ql_cafe: ['Naver Cafe', 'Naverカフェ', 'Naver社区'],
    ql_diocese: ['Diocese of Jeonju', '全州教区', '全州教区'],
    ql_goodnews: ['Goodnews (Korean)', 'Goodnews（韓国語）', 'Goodnews（韩语）'],
    ql_cpbc: ['cpbc Radio', 'cpbc平和放送', 'cpbc和平广播'],
    share: ['Share', '共有', '分享'],
    share_copied: ['Link copied!', 'リンクをコピーしました！', '链接已复制！'],
    share_failed: ['Copy failed', 'コピーできませんでした', '复制失败'],
    bell_open: ['Open notifications', '通知を開く', '打开通知'],
    menu_open: ['Open menu', 'メニューを開く', '打开菜单'],

    // 오늘의 말씀
    liturgy_cta: ["Today's Mass", '今日のミサ', '今日弥撒'],
    'color_백': ['White', '白', '白'],
    'color_홍': ['Red', '赤', '红'],
    'color_녹': ['Green', '緑', '绿'],
    'color_자': ['Violet', '紫', '紫'],
    'color_흑': ['Black', '黒', '黑'],

    // 히어로
    hero_eyebrow: ['Catholic Diocese of Jeonju', 'カトリック全州教区', '天主教全州教区'],
    hero_title: ['Seohakdong Catholic Church', '西鶴洞聖堂', '西鹤洞天主堂'],
    hero_quote: [
      '“In the embrace of Martyrs’ Hill, a path of faith we walk together”',
      '「殉教者の山に抱かれ、共に歩む信仰の道」',
      '“在致命者山的怀抱中，同行信仰之路”',
    ],
    hero_p1: [
      'Rooted in the history of Jeonju and the martyrs’ faith of Chimyeongjasan (Martyrs’ Hill),<br>we share love with our neighbors and walk toward God.',
      '全州の歴史と致命者山（チミョンジャサン）の殉教者の信仰を胸に、<br>隣人と愛を分かち合い、神に向かって歩んでいます。',
      '我们怀着全州的历史与致命者山的殉道信仰，与邻人分享爱，<br>一同走向天主。',
    ],
    hero_p2: [
      'A warm community that shares the joy of faith, hands it on from generation to generation,<br>and lives the Gospel in everyday life.',
      '信仰の喜びを分かち合い、世代を超えて信仰を伝え、<br>日々の生活の中で福音を生きる温かい共同体。',
      '一个温暖的团体：共享信仰的喜乐，代代传承信仰，<br>在日常生活中活出福音。',
    ],
    hero_p3: ['This is Seohakdong Catholic Church.', 'それが西鶴洞聖堂です。', '这就是西鹤洞天主堂。'],
    hero_btn_location: ['Directions', 'アクセス', '交通指南'],

    // 미사시간
    mass_title: ['Mass Times', 'ミサの時間', '弥撒时间'],
    mass_sat: ['Saturday', '土曜日', '周六'],
    mass_sat_note: ['Sunday Vigil Mass (Youth & Young Adults)', '主日の前晩のミサ（中高生・青年）', '主日前夕弥撒（青少年·青年）'],
    mass_sun: ['Sunday', '日曜日（主日）', '主日（周日）'],
    mass_sun_note: ['Main Parish Mass', '主日の中心ミサ', '主日主要弥撒'],
    day_mon: ['Mon', '月', '周一'],
    day_tue: ['Tue', '火', '周二'],
    day_wed: ['Wed', '水', '周三'],
    day_thu: ['Thu', '木', '周四'],
    day_fri: ['Fri', '金', '周五'],
    address_short: [
      '⛪ 51 Seohak-ro, Wansan-gu, Jeonju <span class="nowrap">(전주시 완산구 서학로 51)</span>',
      '⛪ 全州市 完山区 ソハク路 51<span class="nowrap">（전주시 완산구 서학로 51）</span>',
      '⛪ 全州市 完山区 西鹤路 51<span class="nowrap">（전주시 완산구 서학로 51）</span>',
    ],

    // 본당 소개
    intro_title: ['About Our Parish', '聖堂紹介', '堂区介绍'],
    intro_verse: [
      '“But as for me and my household, we will serve the LORD.” <span class="verse-cite-inline">Joshua 24:15</span>',
      '「ただし、わたしとわたしの家は主に仕えます。」 <span class="verse-cite-inline">ヨシュア記 24章15節</span>',
      '“至于我和我的家族，我们必要事奉上主。” <span class="verse-cite-inline">若苏厄书 24:15</span>',
    ],
    intro_photo_alt: ['Exterior of Seohakdong Catholic Church', '西鶴洞聖堂の外観', '西鹤洞天主堂外观'],
    intro_desc: [
      'Seohakdong Catholic Church was separated from Jeondong Cathedral and founded in 1968. It is a community of faith under the patronage of the Holy Family of Jesus, Mary and Joseph.<br>As a root of evangelization in southern Jeonju, our parish shares the joy of faith through the Word, prayer and sharing, hands on the faith from generation to generation, and lives out the values of the Gospel.',
      '殿洞聖堂から分かれた西鶴洞聖堂は1968年に設立され、イエス・マリア・ヨセフの聖家族を保護者とする信仰共同体です。<br>全州南部の福音宣教の根となってきた私たち西鶴洞教会は、みことばと祈り、分かち合いを通して信仰の喜びを共にし、世代を超えて信仰を伝え、福音の価値を実践しています。',
      '西鹤洞天主堂从殿洞天主堂分出，于1968年成立，是以耶稣、玛利亚、若瑟圣家为主保的信仰团体。<br>作为全州南部福传的根基，我们西鹤洞堂区通过圣言、祈祷与分享，共享信仰的喜乐，代代传承信仰，实践福音的价值。',
    ],
    intro_founded: ['Founded', '設立', '成立'],
    intro_founded_val: ['January 1, 1968', '1968年1月1日', '1968年1月1日'],
    intro_patron: ['Patron', '保護者', '主保'],
    intro_patron_val: ['The Holy Family of Jesus, Mary and Joseph', 'イエス・マリア・ヨセフの聖家族', '耶稣、玛利亚、若瑟圣家'],
    intro_patron_sub: [
      'Parish Day: Feast of the Holy Family (Sunday within the Octave of Christmas)',
      '教会の日：聖家族の祝日（主の降誕の八日間中の主日）',
      '堂区日：圣家节（圣诞八日庆期内的主日）',
    ],
    intro_pastor: ['Pastor', '主任司祭', '本堂神父'],
    intro_pastor_val: ['Fr. Paul Hwang Eui-hyun', 'パウロ ファン・ウィヒョン神父', '保禄 Hwang Eui-hyun 神父'],
    intro_members: ['Parishioners', '信徒数', '教友人数'],
    intro_members_val: ['863 households · 1,679 people', '863世帯・1,679人', '863户 · 1,679人'],
    pastors_title: ['Past Pastors', '歴代主任司祭', '历任本堂神父'],
    pastors_note: [
      'The list, photos and order of pastors since the parish’s founding in 1968 will be posted after confirmation by the parish.',
      '1968年の設立以来の歴代主任司祭の名簿・写真・代数は、教会で確認の上掲載します。',
      '1968年成立以来历任本堂神父的名单、照片与任次，将在堂区确认后公布。',
    ],
    priests_title: ['Priests from Our Parish', '当教会出身の司祭', '本堂区出身的神父'],
    priests_note: [
      'The list and photos of priests and religious from Seohakdong parish will be posted after confirmation by the parish.',
      '西鶴洞教会出身の司祭・修道者の名簿と写真は、教会で確認の上掲載します。',
      '西鹤洞堂区出身的神父与修会会士名单及照片，将在堂区确认后公布。',
    ],
    pastor_tbd: ['TBD', '確認中', '待确认'],
    pastor_current: ['Current', '現主任', '现任'],
    pastor_gen: ['No. {n}', '第{n}代', '第{n}任'],
    pastor_since: ['{d} – present', '{d} ～ 現在', '{d} 至今'],

    // 공지·주보
    notice_title: ['Notices & Bulletins', 'お知らせ・週報', '公告·周报'],
    notice_verse: [
      '“How beautiful are the feet<br class="br-mobile"> of those who bring good news!”<br class="br-mobile"> <span class="verse-cite-inline">Romans 10:15</span>',
      '「良い知らせを伝える者の足は、<br class="br-mobile">なんと美しいことか。」<br class="br-mobile"> <span class="verse-cite-inline">ローマの信徒への手紙 10章15節</span>',
      '“报喜讯者的脚步，<br class="br-mobile">是多么美丽！”<br class="br-mobile"> <span class="verse-cite-inline">罗马书 10:15</span>',
    ],
    bulletin_latest: ['Latest bulletin', '最新の週報', '最新周报'],
    bulletin_latest_date: ['Latest bulletin ({d})', '最新の週報（{d}）', '最新周报（{d}）'],
    bulletin_preparing_title: ['Bulletins coming soon', '週報を準備中です', '周报准备中'],
    bulletin_preparing: ['Coming soon', '準備中', '准备中'],
    bulletin_empty: ['No bulletins have been posted yet.', 'まだ週報が登録されていません。', '尚未发布周报。'],
    bulletin_pick_year: ['Select a year to see the bulletins.', '年を選ぶと週報の一覧が表示されます。', '选择年份即可查看周报列表。'],
    bulletin_view: ['View bulletin', '週報を見る', '查看周报'],
    bulletin_year: ['{y}', '{y}年', '{y}年'],
    bulletin_page_alt: ['{d} bulletin, page {n}', '{d} 週報 {n}ページ', '{d} 周报 第{n}页'],
    bulletin_pages: [' ({n} pages, scroll down)', '（{n}ページ、下にスクロールしてください）', '（共{n}页，请向下滑动）'],

    // 갤러리
    gallery_title: ['Parish Moments', '教会のひととき', '堂区剪影'],
    gallery_verse: [
      '“How very good and pleasant it is<br class="br-mobile"> when kindred live together in unity!”<br class="br-mobile"> <span class="verse-cite-inline">Psalm 133:1</span>',
      '「見よ、兄弟が共に座っている。<br class="br-mobile">なんという恵み、なんという喜び。」<br class="br-mobile"> <span class="verse-cite-inline">詩編 133編1節</span>',
      '“看，弟兄们和睦同居，<br class="br-mobile">是多么的美好，多么的快乐！”<br class="br-mobile"> <span class="verse-cite-inline">圣咏集 133:1</span>',
    ],
    gallery_pages_aria: ['Gallery pages', 'ギャラリーのページ', '相册页码'],
    gallery_decade: ['{d}s', '{d}年代', '{d}年代'],
    gallery_decade_empty: ['Coming soon', '準備中', '准备中'],
    gallery_empty: ['No photos have been posted yet.', 'まだ写真が登録されていません。', '尚未上传照片。'],
    gallery_count: [' · {n} photos', '・{n}枚', ' · {n}张'],
    page_first: ['First', '最初', '首页'],
    page_prev: ['Prev', '前へ', '上一页'],
    page_next: ['Next', '次へ', '下一页'],
    page_last: ['Last', '最後', '末页'],
    photo_prev: ['Previous photo', '前の写真', '上一张'],
    photo_next: ['Next photo', '次の写真', '下一张'],
    photo_preparing: ['No photo yet', '写真準備中', '照片准备中'],
    close: ['Close', '閉じる', '关闭'],

    // 오시는 길
    loc_title: ['Directions', 'アクセス', '交通指南'],
    loc_verse: [
      '“Let anyone who is thirsty come to me and drink.” <span class="verse-cite-inline">John 7:37</span>',
      '「渇いている人はだれでも、わたしのところに来て飲みなさい。」 <span class="verse-cite-inline">ヨハネによる福音書 7章37節</span>',
      '“谁若渴，到我这里来喝吧！” <span class="verse-cite-inline">若望福音 7:37</span>',
    ],
    map_fail: [
      'The map could not be loaded.<br>Please use the button below to see the location.',
      '地図を読み込めませんでした。<br>下のボタンから場所をご確認ください。',
      '地图无法加载。<br>请点击下方按钮查看位置。',
    ],
    map_open_kakao: ['Open in Kakao Map', 'カカオマップで開く', '在Kakao地图中打开'],
    map_caption: [
      '51 Seohak-ro, Wansan-gu, Jeonju (55101) · Seohakdong Catholic Church',
      '全州市 完山区 ソハク路 51（〒55101）・西鶴洞聖堂',
      '全州市 完山区 西鹤路 51（邮编 55101）· 西鹤洞天主堂',
    ],
    map_legend_us: ['Seohakdong Catholic Church', '西鶴洞聖堂', '西鹤洞天主堂'],
    map_legend_others: ['Other Catholic churches in Jeonju', '全州市内のほかの聖堂', '全州市内其他天主堂'],
    route_1: ['Jeondong Cathedral', '殿洞聖堂', '殿洞天主堂'],
    route_2: ['Jeonjucheon Stream · Ssajeon Bridge', '全州川・サジョン橋', '全州川 · Ssajeon桥'],
    route_3: ['Walk east', '東へ徒歩', '向东步行'],
    route_4: [
      'Seohakdong Catholic Church, across from Jeonju National University of Education',
      '全州教育大学の向かい・西鶴洞聖堂',
      '全州教育大学对面 · 西鹤洞天主堂',
    ],
    route_dist: ['About 0.8 km', '約0.8km', '约0.8公里'],
    route_time: ['12 min walk', '徒歩12分', '步行12分钟'],
    contact_address: ['Address', '住所', '地址'],
    contact_address_val: ['51 Seohak-ro (55101)', 'ソハク路 51（〒55101）', '西鹤路 51（邮编 55101）'],
    contact_office: ['Parish Office', '事務室', '堂区办公室'],
    contact_rectory: ['Rectory', '司祭館', '神父住所'],
    contact_convent: ['Convent', '修道院', '修女院'],
    contact_fax: ['Fax', 'FAX', '传真'],
    admin_entry: ['Admin', '管理者', '管理员'],

    // 홈 화면에 추가
    install_btn: ['Add to Home Screen', 'ホーム画面に追加', '添加到主屏幕'],
    install_title: ['Add to Home Screen', 'ホーム画面に追加する', '添加到主屏幕'],
    install_ios_lead: ['On iPhone (Safari):', 'iPhone（Safari）の場合：', 'iPhone（Safari）操作方法：'],
    install_ios_1: [
      'Tap the <strong>Share button</strong> (a square with an arrow pointing up) at the bottom of the screen.',
      '画面下の<strong>共有ボタン</strong>（四角から上向きの矢印が出ている形）をタップします。',
      '点击屏幕下方的<strong>分享按钮</strong>（方框中向上箭头的图标）。',
    ],
    install_ios_2: [
      'Scroll down and tap <strong>“Add to Home Screen”</strong>.',
      '下にスクロールして<strong>「ホーム画面に追加」</strong>をタップします。',
      '向下滑动，点击<strong>“添加到主屏幕”</strong>。',
    ],
    install_ios_3: ['Tap <strong>“Add”</strong> at the top right. That’s it!', '右上の<strong>「追加」</strong>をタップすれば完了です。', '点击右上角的<strong>“添加”</strong>即可。'],
    install_android_lead: ['On Android:', 'Androidの場合：', 'Android操作方法：'],
    install_android_1: [
      'Tap the <strong>menu button (⋮ or ≡)</strong> at the top or bottom of the screen.',
      '画面の上か下にある<strong>メニューボタン（⋮ または ≡）</strong>をタップします。',
      '点击屏幕上方或下方的<strong>菜单按钮（⋮ 或 ≡）</strong>。',
    ],
    install_android_2: [
      'Tap <strong>“Add to Home screen”</strong> or <strong>“Install app”</strong>.',
      '<strong>「ホーム画面に追加」</strong>または<strong>「アプリをインストール」</strong>をタップします。',
      '点击<strong>“添加到主屏幕”</strong>或<strong>“安装应用”</strong>。',
    ],
    install_android_3: ['Tap <strong>“Add”</strong>. That’s it!', '<strong>「追加」</strong>をタップすれば完了です。', '点击<strong>“添加”</strong>即可。'],
    install_inapp_lead: [
      'This can’t be installed inside the KakaoTalk browser. Try this:',
      'カカオトークのアプリ内ではインストールできません。次の手順をお試しください。',
      '在KakaoTalk内置浏览器中无法安装，请按以下步骤操作：',
    ],
    install_inapp_1: ['Go <strong>back</strong> to the chat room.', '<strong>戻る</strong>でトークルームに戻ります。', '点击<strong>返回</strong>回到聊天室。'],
    install_inapp_2: ['<strong>Press and hold</strong> the link.', 'リンクを<strong>長押し</strong>します。', '<strong>长按</strong>该链接。'],
    install_inapp_3: [
      'Choose <strong>“Open in another browser”</strong> (or “Open in Chrome”).',
      '<strong>「他のブラウザで開く」</strong>（または「Chromeで開く」）を選びます。',
      '选择<strong>“用其他浏览器打开”</strong>（或“用Chrome打开”）。',
    ],
    install_inapp_4: ['Tap this button again on the new screen.', '新しく開いた画面で、もう一度このボタンをタップします。', '在新打开的页面中再次点击此按钮。'],
    install_pc_lead: ['On a computer:', 'パソコンの場合：', '电脑操作方法：'],
    install_pc_1: [
      'Click the <strong>install icon</strong> (a monitor with a ↓) at the right end of the address bar.',
      'アドレスバー右端の<strong>インストールアイコン</strong>（モニターに↓の形）をクリックします。',
      '点击地址栏右侧的<strong>安装图标</strong>（显示器加↓的图标）。',
    ],
    install_pc_2: ['Click <strong>“Install”</strong>. That’s it!', '<strong>「インストール」</strong>をクリックすれば完了です。', '点击<strong>“安装”</strong>即可。'],
    install_pc_note: [
      'If you don’t see the install icon, it’s already installed. Open it from the <strong>Seohakdong</strong> icon on your taskbar or Start menu.',
      'インストールアイコンが見えない場合は、すでにインストール済みです。タスクバーやスタートメニューの<strong>西鶴洞聖堂</strong>アイコンから開いてください。',
      '如果看不到安装图标，说明已经安装。请从任务栏或开始菜单中的<strong>西鹤洞天主堂</strong>图标打开。',
    ],
    install_note: [
      'Add it once, and from then on you can open it like an app from the icon on your home screen.',
      '一度追加しておけば、次からはホーム画面のアイコンからアプリのようにすぐ開けます。',
      '只需添加一次，以后即可像应用一样从主屏幕图标直接打开。',
    ],

    // 알림
    notif_title: ['Notifications', '通知', '通知'],
    notif_empty: ['No notifications yet.', 'まだ通知はありません。', '暂无通知。'],
    notif_delete: ['Delete this notification', 'この通知を削除', '删除此通知'],
    push_on: ['Get notifications', '通知を受け取る', '接收通知'],
    push_subscribed: ['Notifications on ✓', '通知を受信中 ✓', '已开启通知 ✓'],
    push_turning_on: ['Turning on…', '通知をオンにしています…', '正在开启…'],
    push_failed: ['Couldn’t turn on — please tap again', 'オンにできませんでした。もう一度タップしてください', '开启失败，请再点一次'],
    push_off: ['🔕 Notifications off', '🔕 通知オフ', '🔕 已关闭通知'],
    push_modal_title: ['Get parish notifications', '教会からの通知を受け取る', '接收堂区通知'],
    push_ios_lead: [
      'On iPhone, you need to add this site to your home screen first to get notifications.',
      'iPhoneでは、先にホーム画面に追加すると通知を受け取れます。',
      '在iPhone上，需要先添加到主屏幕才能接收通知。',
    ],
    push_ios_1: [
      'Close this window and tap the <strong>“Add to Home Screen”</strong> button first.',
      'この画面を閉じて、先に<strong>「ホーム画面に追加」</strong>ボタンをタップしてください。',
      '请关闭此窗口，先点击<strong>“添加到主屏幕”</strong>按钮。',
    ],
    push_ios_2: [
      'Open the site again from the new home screen icon and tap <strong>“Get notifications”</strong>.',
      'ホーム画面に追加されたアイコンから開き直して、<strong>「通知を受け取る」</strong>をタップしてください。',
      '从主屏幕新添加的图标重新打开，再点击<strong>“接收通知”</strong>。',
    ],
    push_denied_lead: [
      'Notifications are blocked. Please turn them back on in your browser settings.',
      '通知がブロックされています。ブラウザの設定でオンにしてください。',
      '通知已被阻止，请在浏览器设置中重新开启。',
    ],
    push_denied_1: [
      'Tap the <strong>lock icon</strong> to the left of the address bar (or open browser settings).',
      'アドレスバー左の<strong>鍵アイコン</strong>（またはブラウザの設定）をタップします。',
      '点击地址栏左侧的<strong>锁形图标</strong>（或打开浏览器设置）。',
    ],
    push_denied_2: [
      'Find <strong>“Notifications”</strong> and change it to <strong>Allow</strong>.',
      '<strong>「通知」</strong>の項目を<strong>許可</strong>に変更します。',
      '找到<strong>“通知”</strong>，改为<strong>允许</strong>。',
    ],
    push_denied_3: ['Reload this page and tap again.', 'このページを再読み込みして、もう一度タップしてください。', '刷新此页面后再点一次。'],
    push_inapp_lead: [
      'Notifications can’t be turned on inside the KakaoTalk browser.',
      'カカオトークのアプリ内では通知をオンにできません。',
      '在KakaoTalk内置浏览器中无法开启通知。',
    ],
    push_inapp_note: [
      'Tap the menu at the top right, choose <strong>“Open in another browser”</strong>, then tap again there.',
      '右上のメニューから<strong>「他のブラウザで開く」</strong>を選び、開いた画面でもう一度タップしてください。',
      '请点击右上角菜单，选择<strong>“用其他浏览器打开”</strong>，然后在新页面中再点一次。',
    ],
    push_modal_note: [
      'We only send notifications when there is news from the parish. You can turn them on or off anytime from the bell (notifications) button.',
      '教会からのお知らせがあるときだけ通知します。ベル（通知）ボタンからいつでもオン・オフできます。',
      '只有堂区有消息时才会发送通知。您可随时通过铃铛（通知）按钮开启或关闭。',
    ],
    optin_title: ['Would you like to get notifications?', '通知を受け取りますか？', '要接收通知吗？'],
    optin_lead: [
      'We’ll let you know on your phone when a notice is posted. You can turn this on or off anytime in Notifications.',
      'お知らせが掲載されたら、スマートフォンにすぐお知らせします。通知画面からいつでもオン・オフできます。',
      '有新公告时会立即通知您的手机。您可随时在通知中开启或关闭。',
    ],
    optin_yes: ['Yes, please', 'はい、受け取ります', '好，接收'],
    optin_no: ['No, thanks', '今はいいです', '不用了'],

    // 공지 팝업
    announce_hide_today: ['Don’t show again today', '今日は表示しない', '今天不再显示'],
  };

  function fill(str, vars) {
    return vars ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : '')) : str;
  }

  // 한국어일 때나 번역이 없을 때는 ko(원문)를 그대로 돌려준다
  function t(key, ko, vars) {
    const row = D[key];
    const s = lang !== 'ko' && row ? row[IDX] : ko;
    return s == null ? s : fill(s, vars);
  }

  function applyStatic(root) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = t(el.dataset.i18n);
      if (v != null) el.textContent = v;
    });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = t(el.dataset.i18nHtml);
      if (v != null) el.innerHTML = v;
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const v = t(el.dataset.i18nAria);
      if (v != null) el.setAttribute('aria-label', v);
    });
    root.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const v = t(el.dataset.i18nAlt);
      if (v != null) el.setAttribute('alt', v);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const v = t(el.dataset.i18nTitle);
      if (v != null) el.setAttribute('title', v);
    });

    // 역대 주임신부 목록은 칸이 많아 규칙으로 바꾼다 ("1대" → "No. 1", "확인중" → "TBD" 등)
    root.querySelectorAll('.pastor-list span').forEach((el) => {
      const s = el.textContent.trim();
      let m;
      if (s === '확인중') el.textContent = t('pastor_tbd');
      else if (s === '현 주임') el.textContent = t('pastor_current');
      else if ((m = s.match(/^(\d+)대$/))) el.textContent = t('pastor_gen', null, { n: m[1] });
      else if ((m = s.match(/^([\d.]+) ~ 현재$/))) el.textContent = t('pastor_since', null, { d: m[1] });
      else if (s === '황의현 바오로 신부') el.textContent = t('intro_pastor_val');
    });

    const colorEl = document.getElementById('liturgyColor');
    if (colorEl) colorEl.textContent = t('color_' + colorEl.dataset.color, colorEl.textContent);

    document.title = t('page_title', document.title);
  }

  // ---------- 언어 선택 버튼 ----------
  function setLang(next) {
    if (!LANGS.includes(next)) return;
    try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* 무시 */ }
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    location.replace(url.toString());
  }

  const NATIVE_NAMES = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' };

  function bindSwitchers() {
    document.querySelectorAll('.lang-switch').forEach((box) => {
      const btn = box.querySelector('.lang-btn');
      const menu = box.querySelector('.lang-menu');
      if (!btn || !menu) return;
      const label = btn.querySelector('.lang-btn-label');
      if (label) label.textContent = NATIVE_NAMES[lang];
      menu.querySelectorAll('[data-lang]').forEach((opt) => {
        if (opt.dataset.lang === lang) opt.setAttribute('aria-current', 'true');
        opt.addEventListener('click', () => setLang(opt.dataset.lang));
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !box.classList.contains('open');
        document.querySelectorAll('.lang-switch.open').forEach((b) => b.classList.remove('open'));
        box.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-switch.open').forEach((box) => {
        if (!box.contains(e.target)) {
          box.classList.remove('open');
          const b = box.querySelector('.lang-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  window.I18N = { lang, locale: LOCALE, t };

  bindSwitchers();
  if (lang !== 'ko') {
    applyStatic(document);
    document.querySelectorAll('.i18n-only').forEach((el) => { el.hidden = false; });
  }
  document.documentElement.classList.remove('i18n-pending');
})();
