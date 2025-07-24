import { AlipayParser } from '../alipay';
import iconv from 'iconv-lite';

describe('AlipayParser', () => {
  const parser = new AlipayParser();

  it('should return true for alipay bill file', () => {
    const file = new File([''], 'alipay_bill.csv');
    expect(parser.canParse(file)).toBe(true);
  });

  it('should return true for 支付宝 bill file', () => {
    const file = new File([''], '支付宝账单.csv');
    expect(parser.canParse(file)).toBe(true);
  });

  it('should return false for other file', () => {
    const file = new File([''], 'other_bill.csv');
    expect(parser.canParse(file)).toBe(false);
  });

  it('should parse alipay bill data correctly', async () => {
    const csvData = `交易号,商家订单号,交易创建时间,付款时间,最近修改时间,交易来源地,类型,交易对方,商品名称,金额（元）,收/支,交易状态
12345,67890,2024-07-22 10:00:00,2024-07-22 10:00:00,2024-07-22 10:00:00,来源,支出,对方,淘宝购物,-100.00,支出,交易成功
`;
    const data = iconv.encode(csvData, 'gbk');
    const result = await parser.parse(data);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('淘宝购物');
    expect(result[0].amount).toBe(100);
    expect(result[0].type).toBe('EXPENSE');
    expect(result[0].date).toEqual(new Date('2024-07-22 10:00:00'));
    expect(result[0].category).toBe('购物');
  });
});
