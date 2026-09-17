import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

function getSettingsData() {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      return { heroBadge: 'DexX Kernel v2.4 Yayında', heroUserCount: '2,000+' };
    }
    const raw = fs.readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { heroBadge: 'DexX Kernel v2.4 Yayında', heroUserCount: '2,000+' };
  }
}

export async function GET() {
  return NextResponse.json(getSettingsData());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getSettingsData();
    const updated = { ...current, ...body };

    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}