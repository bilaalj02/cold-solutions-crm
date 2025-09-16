import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/knowledge-base';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query');
    const industry = searchParams.get('industry');
    
    switch (type) {
      case 'services':
        if (query) {
          const services = knowledgeBaseService.searchServices(query);
          return NextResponse.json({ services });
        } else {
          const services = knowledgeBaseService.getAllServices();
          return NextResponse.json({ services });
        }
      
      case 'faq':
        if (query) {
          const faq = knowledgeBaseService.searchFAQ(query);
          return NextResponse.json({ faq });
        } else {
          const faq = knowledgeBaseService.getAllFAQ();
          return NextResponse.json({ faq });
        }
      
      case 'usecases':
        const useCases = knowledgeBaseService.searchUseCases(industry || undefined);
        return NextResponse.json({ useCases });
      
      default:
        return NextResponse.json({
          services: knowledgeBaseService.getAllServices(),
          faq: knowledgeBaseService.getAllFAQ(),
          useCases: knowledgeBaseService.getAllUseCases()
        });
    }
  } catch (error) {
    console.error('Error fetching knowledge base data:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge base data' }, { status: 500 });
  }
}