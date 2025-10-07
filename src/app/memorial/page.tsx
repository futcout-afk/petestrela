
"use client";

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Dog, Cat, Calendar, Heart, User, Venus, Mars, TreePine, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { seedPetProfiles } from '@/lib/seed-data';
import { Badge } from '@/components/ui/badge';

type PetProfile = {
  id: string;
  name: string;
  tutors: string;
  animalType: string;
  sex: 'Macho' | 'Fêmea';
  breed: string;
  birthDate: string;
  cremationDate: string;
  tree: string;
  shortDescription: string;
  fullDescription: string;
  imageUrls: string[];
  memorialCode: string;
};

const MediaItem = ({ src, alt }: { src: string, alt: string }) => {
    if (!src) return <Skeleton className="w-full h-full" />;
    
    const isVideo = src.endsWith('.mp4');

    if (isVideo) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />
        );
    }
    
    return (
         <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
        />
    );
}


export default function MemorialPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [animalFilter, setAnimalFilter] = React.useState('all');
    const [sortOrder, setSortOrder] = React.useState('protocol_desc');
    const [selectedPet, setSelectedPet] = React.useState<PetProfile | null>(null);

    const formatDate = React.useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Data inválida";

            if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0) {
                 const offset = date.getTimezoneOffset();
                 date.setMinutes(date.getMinutes() + offset);
            }

            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC' 
            }).format(date);
        } catch(e) {
            console.error("Error formatting date:", e, "Input:", dateString);
            return "Data inválida";
        }
    }, []);

    const filteredAndSortedPets = React.useMemo(() => {
        return seedPetProfiles
            .filter(pet => {
                if (!pet || !pet.name) return false;

                const searchTermLower = searchTerm.toLowerCase();

                const matchesSearch = 
                    pet.name.toLowerCase().includes(searchTermLower) ||
                    pet.memorialCode.toLowerCase().includes(searchTermLower) ||
                    pet.breed.toLowerCase().includes(searchTermLower) ||
                    pet.tutors.toLowerCase().includes(searchTermLower) ||
                    formatDate(pet.cremationDate).toLowerCase().includes(searchTermLower);

                const matchesAnimal = animalFilter === 'all' || pet.animalType === animalFilter;
                
                return matchesSearch && matchesAnimal;
            })
            .sort((a, b) => {
                if (sortOrder === 'name_asc') {
                    return a.name.localeCompare(b.name);
                }
                if (sortOrder === 'name_desc') {
                    return b.name.localeCompare(a.name);
                }

                if(sortOrder.includes('protocol')) {
                    const numA = parseInt(a.memorialCode.replace('#', ''));
                    const numB = parseInt(b.memorialCode.replace('#', ''));
                    if(sortOrder === 'protocol_asc') return numA - numB;
                    return numB - numA;
                }
                
                try {
                    const dateA = new Date(a.cremationDate).getTime();
                    const dateB = new Date(b.cremationDate).getTime();
                    
                     if (isNaN(dateA) || isNaN(dateB)) return 0;
                    
                     if (sortOrder === 'cremationDate_asc') {
                        return dateA - dateB;
                    }
                    return dateB - dateA; // Default is 'cremationDate_desc'
                } catch(e) {
                    console.error("Error parsing date for sorting:", e);
                    return 0; 
                }
               
            });
    }, [searchTerm, animalFilter, sortOrder, formatDate]);

    const handlePetClick = (pet: PetProfile) => {
        setSelectedPet(pet);
    };

    const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
        <div className="flex items-start gap-3 text-sm">
            <div className="text-primary pt-0.5">{icon}</div>
            <div className="flex flex-col">
              <span className="font-semibold">{label}</span>
              <span className="text-muted-foreground">{value || 'Não informado'}</span>
            </div>
        </div>
    );

    
    const showNoResults = filteredAndSortedPets.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <section className="relative h-[50vh] min-h-[400px] text-white flex items-center justify-center text-center overflow-hidden">
                <video
                    src="https://i.imgur.com/3V6WYmV.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative container mx-auto max-w-7xl px-4 z-10">
                    <h1 className="font-headline text-4xl md:text-6xl font-bold drop-shadow-md">Memorial Pet Estrela</h1>
                    <p className="mt-4 text-base max-w-2xl mx-auto drop-shadow-sm">
                        As cinzas de cada pet são depositadas junto à muda escolhida e recebem uma identificação única. Por meio do QR Code, é possível consultar essa numeração e acessar as informações sobre o animal e a árvore que guarda sua lembrança.
                    </p>
                </div>
            </section>

            <section className="container mx-auto max-w-7xl px-4 py-12">
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Buscar por nome, protocolo, raça, tutor ou data..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select value={animalFilter} onValueChange={setAnimalFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por animal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Animais</SelectItem>
                                <SelectItem value="Cão"><Dog className="inline-block mr-2 h-4 w-4" />Cães</SelectItem>
                                <SelectItem value="Gato"><Cat className="inline-block mr-2 h-4 w-4" />Gatos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="protocol_desc">Protocolo (Mais Recente)</SelectItem>
                                <SelectItem value="protocol_asc">Protocolo (Mais Antigo)</SelectItem>
                                <SelectItem value="cremationDate_desc">Cremação (Mais Recente)</SelectItem>
                                <SelectItem value="cremationDate_asc">Cremação (Mais Antigo)</SelectItem>
                                <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                                <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedPets.map(pet => {
                        return (
                            <Card key={pet.id} className="group overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1" onClick={() => handlePetClick(pet)}>
                                <CardContent className="p-0">
                                    <div className="relative aspect-square">
                                        <Badge variant="secondary" className="absolute top-3 left-3 z-10 text-base">
                                            {pet.memorialCode}
                                        </Badge>
                                        {pet.imageUrls?.[0] && (
                                            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                                                <MediaItem src={pet.imageUrls[0]} alt={pet.name} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-4 text-white">
                                            <h3 className="font-headline text-2xl font-bold">{pet.name}</h3>
                                            <p className="font-body text-sm opacity-80">{pet.breed}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <p className="text-sm italic text-muted-foreground line-clamp-2">"{pet.shortDescription}"</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
                 {showNoResults && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhum perfil de memorial encontrado com os filtros atuais.</p>
                    </div>
                )}
            </section>
            
            <Dialog open={!!selectedPet} onOpenChange={(isOpen) => !isOpen && setSelectedPet(null)}>
                <DialogContent className="sm:max-w-4xl p-0">
                    {selectedPet && (
                        <div className="grid md:grid-cols-2">
                            <div className='w-full'>
                                <Carousel className="w-full rounded-l-lg overflow-hidden">
                                    <CarouselContent>
                                        {(selectedPet.imageUrls || []).map((url, index) => (
                                            <CarouselItem key={index}>
                                                 <div className="relative aspect-square w-full">
                                                    <MediaItem src={url} alt={`${selectedPet.name} - foto ${index + 1}`} />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4"/>
                                    <CarouselNext className="right-4"/>
                                </Carousel>
                            </div>
                            <div className="p-6 flex flex-col">
                                <DialogHeader className="text-left mb-4">
                                    <DialogTitle className="font-headline text-4xl text-primary mb-2">{selectedPet.name}</DialogTitle>
                                    <DialogDescription className='italic'>
                                        "{selectedPet.shortDescription}"
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 flex-grow">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedPet.fullDescription}</p>

                                    <Separator />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                      <InfoItem icon={<Hash size={16}/>} label="Protocolo" value={selectedPet.memorialCode} />
                                      <InfoItem icon={<User size={16}/>} label="Tutores" value={selectedPet.tutors} />
                                      <InfoItem icon={selectedPet.sex === 'Macho' ? <Mars size={16}/> : <Venus size={16}/>} label="Sexo" value={selectedPet.sex} />
                                      <InfoItem icon={<Heart size={16}/>} label="Raça" value={selectedPet.breed} />
                                      <InfoItem icon={<TreePine size={16}/>} label="Árvore Memorial" value={selectedPet.tree} />
                                      <InfoItem icon={<Calendar size={16}/>} label="Nascimento" value={formatDate(selectedPet.birthDate)} />
                                      <InfoItem icon={<Calendar size={16}/>} label="Cremação" value={formatDate(selectedPet.cremationDate)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );

    

    