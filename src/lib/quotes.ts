// Default quotes dataset - 50 quotes
export const defaultQuotes: string[] = [
  'Nước có thể ngập nhà, nhưng không được ngập ý chí.',
  'Bình tĩnh là chiếc áo phao đầu tiên.',
  'Qua cơn bĩ cực đến hồi thái lai.',
  'Còn người là còn tất cả.',
  'Một lời hỏi thăm giữa lũ cũng là một chiếc phao.',
  'Đêm dài mấy rồi cũng sáng.',
  'Đã cùng nhau vượt nước, thì cũng cùng nhau dựng lại nhà.',
  'Không ai bị bỏ lại phía sau.',
  'Giữ an toàn trước, giữ của sau.',
  'Một người vững, cả nhà vững.',
  'Hôm nay cố thêm một chút, ngày mai sẽ bớt một nỗi lo.',
  'Giữa dòng chảy, điều quý nhất là sự bình tĩnh và tình người.',
  'Mưa có thể nặng hạt, lòng người đừng nặng.',
  'Sống sót là thắng lợi lớn nhất.',
  'Nắm tay nhau chặt hơn khi nước lên.',
  'Trong nguy có cơ—trong lũ có tình.',
  'Đừng hoảng: thở sâu, làm từng bước.',
  'Một hành động đúng lúc hơn ngàn lời lo lắng.',
  'Giữ pin cho điện thoại, giữ sức cho chính mình.',
  'Cứu mình trước để còn cứu người.',
  'Hy vọng không cần sóng—chỉ cần người.',
  'Mất đồ còn mua lại được; mất bình tĩnh là mất đường sống.',
  'Lũ rút rồi, mình dựng lại—từ nền vững đến mái ấm.',
  'Tối nay khó, nhưng mình không đơn độc.',
  'Thương nhau lúc hoạn nạn mới là thương thật.',
  'Bình tĩnh để sống, tỉnh táo để cứu.',
  'Nước lên nhanh, quyết định phải nhanh hơn.',
  'Nghe cơ thể: mệt là phải nghỉ.',
  'Đừng liều một mình—gọi người gần nhất.',
  'Một ánh đèn nhỏ cũng dẫn đường.',
  'Cứ từng bước một: an toàn là đích.',
  'Giữ ấm, giữ khô, giữ sức.',
  'Không có anh hùng đơn độc trong lũ.',
  'Hôm nay mình giữ nhau, mai mình dựng lại.',
  'Sợ là bình thường—hoảng mới nguy.',
  'Tin đúng nguồn, bớt hoang mang.',
  'Đèn pin còn sáng, hy vọng còn gần.',
  'Cứu người trước, cứu đồ sau.',
  'Đừng ngại nhờ giúp—đó là sống.',
  'Một tin nhắn đúng lúc, một mạng sống.',
  'Ở đâu có người, ở đó có đường.',
  'Nước rút rồi, lòng mình không rút.',
  'Cố thêm chút nữa—mình sắp qua rồi.',
  'Tình người là \'đê\' vững nhất.',
  'Giữ nhau chặt—đừng để ai lạc.',
  'Bão qua, người ở lại—mình bắt đầu lại.',
  'Ngập nhà không ngập lòng.',
  'Chậm lại để đúng, đúng để sống.',
  'Không có gì quý hơn bình an.',
  'Mình còn thở là mình còn cơ hội.',
];

// Quote themes with proper contrast
export const quoteThemes = [
  { id: 1, name: 'Lavender', bg: '#DBC0E8', text: '#252D45', subtext: '#6B515E', accent: '#47B5A8' },
  { id: 2, name: 'Blue', bg: '#A3C1E2', text: '#252D45', subtext: '#6B515E', accent: '#F76F54' },
  { id: 3, name: 'Daffodil', bg: '#F7E289', text: '#252D45', subtext: '#6B515E', accent: '#47B5A8' },
  { id: 4, name: 'Night', bg: '#252D45', text: '#FFFFFF', subtext: '#A3C1E2', accent: '#F7E289' },
  { id: 5, name: 'Peaches', bg: '#FBB28B', text: '#252D45', subtext: '#6B515E', accent: '#EA5E86' },
  { id: 6, name: 'Poppy', bg: '#F76F54', text: '#FFFFFF', subtext: '#DBC0E8', accent: '#F7E289' },
  { id: 7, name: 'Sage', bg: '#A8B2A1', text: '#252D45', subtext: '#6B515E', accent: '#47B5A8' },
  { id: 8, name: 'Fuchsia', bg: '#EA5E86', text: '#FFFFFF', subtext: '#A3C1E2', accent: '#F7E289' },
  { id: 9, name: 'Pool', bg: '#47B5A8', text: '#FFFFFF', subtext: '#DBC0E8', accent: '#F7E289' },
  { id: 10, name: 'Cotton', bg: '#F9A2C5', text: '#252D45', subtext: '#6B515E', accent: '#47B5A8' },
  { id: 11, name: 'Eggplant', bg: '#6B515E', text: '#FFFFFF', subtext: '#A3C1E2', accent: '#F7E289' },
  { id: 12, name: 'Hay', bg: '#B79A65', text: '#252D45', subtext: '#6B515E', accent: '#F76F54' },
];

export interface QuotesState {
  customQuotes: string[];
  favorites: string[];
  lastQuoteIndex: number;
  lastThemeIndex: number;
}

export function loadQuotesState(): QuotesState {
  const saved = localStorage.getItem('flooded_quotes_state');
  if (saved) return JSON.parse(saved);
  return { customQuotes: [], favorites: [], lastQuoteIndex: -1, lastThemeIndex: -1 };
}

export function saveQuotesState(state: QuotesState) {
  localStorage.setItem('flooded_quotes_state', JSON.stringify(state));
}

export function getAllQuotes(state: QuotesState): string[] {
  return [...defaultQuotes, ...state.customQuotes];
}

export function getRandomQuote(allQuotes: string[], lastIndex: number): { quote: string; index: number } {
  if (allQuotes.length <= 1) return { quote: allQuotes[0] || '', index: 0 };
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * allQuotes.length);
  } while (newIndex === lastIndex);
  return { quote: allQuotes[newIndex], index: newIndex };
}

export function getRandomThemeIndex(lastIndex: number): number {
  if (quoteThemes.length <= 1) return 0;
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * quoteThemes.length);
  } while (newIndex === lastIndex);
  return newIndex;
}
