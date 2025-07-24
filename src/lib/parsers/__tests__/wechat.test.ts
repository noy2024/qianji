import { WeChatParser } from '../wechat';
import iconv from 'iconv-lite';

describe('WeChatParser', () => {
  const parser = new WeChatParser();

  it('should return true for wechat bill file', () => {
    const file = new File([''], 'wechat_bill.csv');
    expect(parser.canParse(file)).toBe(true);
  });

  it('should return true for 微信 bill file', () => {
    const file = new File([''], '微信账单.csv');
    expect(parser.canParse(file)).toBe(true);
  });

  it('should return false for other file', () => {
    const file = new File([''], 'other_bill.csv');
    expect(parser.canParse(file)).toBe(false);
  });

  it('should parse wechat bill data correctly', async () => {
    const csvData = `交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态,交易单号,商户单号,备注
2024-07-22 10:00:00,购物,商家,超市购物,支出,100.00,微信支付,支付成功,12345,67890,备注
`;
    const data = iconv.encode(csvData, 'utf-8');
    const result = await parser.parse(data);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('商家');
    expect(result[0].amount).toBe(100);
    expect(result[0].type).toBe('EXPENSE');
    expect(result[0].date).toEqual(new Date('2024-07-22 10:00:00'));
    expect(result[0].category).toBe('日用百货');
  });
});
